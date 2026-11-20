import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {apiUser,unauthorized,bad,forbidden,failure,jsonBody,asString} from "@/lib/api";
import {approvedQuestions,approvedCatalog} from "@/lib/approved-import";
import type {Prisma} from "@prisma/client";
type Params={params:Promise<{id:string}>};
type ParsedSource={subjects?:Array<{code?:string;name?:string;units?:Array<{number?:number;title?:string;topics?:string[]}>}>};
export async function PATCH(req:Request,{params}:Params){
 const user=await apiUser();if(!user)return unauthorized();
 const {id}=await params,body=await jsonBody(req),action=asString(body?.action,25);
 if(!["review","publish","reject","sync-catalog"].includes(action))return bad("Invalid action");
 try{
  const item=await db.syllabusImport.findUnique({where:{id}});
  if(!item)return NextResponse.json({error:"Draft not found"},{status:404});
  if(user.role!=="ADMIN"&&item.userId!==user.id)return forbidden();
  if(["publish","sync-catalog"].includes(action)&&user.role!=="ADMIN")return forbidden();
  if(action==="reject"||action==="review"){
   await db.syllabusImport.update({where:{id},data:{status:action==="review"?"REVIEWED":"REJECTED"}});
   return NextResponse.json({ok:true,status:action==="review"?"REVIEWED":"REJECTED"});
  }
  if(item.status!=="REVIEWED")return bad("Mark and inspect this draft as REVIEWED before publication.");
  const courseInput=approvedCatalog.safeParse(body);
  if(!courseInput.success)return bad("Choose an existing course.");
  const course=await db.course.findUnique({where:{code:courseInput.data.courseCode}});
  if(!course)return bad("Course not found. Choose a course from the verified catalog list.");
  const parsed=item.parsed as ParsedSource|null;
  if(action==="sync-catalog"){
   const matched=parsed?.subjects?.find(s=>s.code===course.code)||
    (parsed?.subjects?.length===1?parsed.subjects[0]:null);
   if(!matched||!Array.isArray(matched.units)||!matched.units.length)return bad("No recognized syllabus units to import.");
   const draftUnits=matched.units.filter(u=>Number.isInteger(u.number)&&Number(u.number)>0&&Number(u.number)<=12&&
     typeof u.title==="string"&&u.title.trim().length>2).slice(0,12);
   if(!draftUnits.length)return bad("No valid numbered units found.");
   const inserted=await db.$transaction(async tx=>{
    let topics=0;
    for(const u of draftUnits){
     const unit=await tx.syllabusUnit.upsert({
      where:{courseId_number:{courseId:course.id,number:u.number!}},
      create:{courseId:course.id,number:u.number!,title:u.title!.slice(0,160),
       description:"Extracted from imported syllabus draft. Admin review required to verify official boundaries.",section:u.number!<=3?"I":"II"},
      update:{} // Never silently overwrite existing curated unit names.
     });
     for(const name of (u.topics||[]).filter(x=>typeof x==="string").slice(0,35)){
      const title=name.trim().slice(0,150);
      if(title.length<3)continue;
      const existing=await tx.syllabusTopic.findFirst({where:{unitId:unit.id,title},select:{id:true}});
      if(!existing){await tx.syllabusTopic.create({data:{unitId:unit.id,title}});topics++;}
     }
    }
    return topics;
   });
   return NextResponse.json({ok:true,courseCode:course.code,units:draftUnits.length,topicsAdded:inserted,
    caveat:"Syllabus draft synced without overwriting curated unit names or granting institutional verification."});
  }
  const submitted=body?.questions??(item.generated as {questions?:unknown}|null)?.questions;
  const validated=approvedQuestions.safeParse(submitted);
  if(!validated.success){
   return NextResponse.json({error:"Questions are not publishable yet. Supply 1–60 manually checked problems with unit, type, stem, correctAnswer, solution and, where relevant, options/code/rubric.",issues:validated.error.issues.slice(0,8).map(i=>({path:i.path.join("."),message:i.message}))},{status:400});
  }
  const units=await db.syllabusUnit.findMany({where:{courseId:course.id},select:{id:true,number:true}});
  const lookup=new Map(units.map(u=>[u.number,u.id]));
  if(validated.data.some(q=>!lookup.has(q.unit)))return bad("One or more draft questions reference a unit that does not exist in this course. Sync or edit the units first.");
  await db.$transaction(async tx=>{
   for(const [position,q] of validated.data.entries()){
    const unitId=lookup.get(q.unit)!;
    let topicId:string|undefined;
    if(q.topic){
     const old=await tx.syllabusTopic.findFirst({where:{unitId,title:q.topic},select:{id:true}});
     topicId=old?.id|| (await tx.syllabusTopic.create({data:{unitId,title:q.topic}})).id;
    }
    await tx.question.upsert({
     where:{id:"approved-"+id+"-"+position},
     create:{
      id:"approved-"+id+"-"+position,courseId:course.id,unitId,topicId,
      stem:q.stem,correctAnswer:q.correctAnswer,solution:q.solution,concept:q.concept,
      code:q.code,options:(q.options||undefined) as Prisma.InputJsonValue|undefined,
      rubric:(q.rubric||undefined) as Prisma.InputJsonValue|undefined,
      type:q.type,source:"AI_DRAFT",verified:false,difficulty:"MEDIUM",
      maxMarks:q.maxMarks,idealSeconds:q.idealSeconds,coCode:"CO"+q.unit
     },
     update:{
      unitId,topicId,stem:q.stem,correctAnswer:q.correctAnswer,solution:q.solution,
      concept:q.concept,code:q.code,
      options:(q.options||undefined) as Prisma.InputJsonValue|undefined,
      rubric:(q.rubric||undefined) as Prisma.InputJsonValue|undefined,
      type:q.type,maxMarks:q.maxMarks,idealSeconds:q.idealSeconds
     }
    });
   }
   await tx.syllabusImport.update({where:{id},data:{
    status:"PUBLISHED",generated:{questions:validated.data,publicationNote:"Reviewed educational drafts. Not verified institutional PYQs."}
   }});
  });
  return NextResponse.json({ok:true,status:"PUBLISHED",questions:validated.data.length,courseCode:course.code,
   caveat:"Published as reviewed educational practice (AI_DRAFT), NOT as official university PYQs."});
 }catch(e){return failure(e)}
}
