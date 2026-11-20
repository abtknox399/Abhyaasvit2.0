import {NextRequest,NextResponse} from "next/server";
import {db} from "@/lib/db";
import {apiUser,unauthorized,bad,failure,jsonBody,asString} from "@/lib/api";
import {TestKind} from "@prisma/client";
export async function GET(){
 const user=await apiUser();if(!user)return unauthorized();
 try{
  const tests=await db.testTemplate.findMany({where:{published:true},
   include:{course:{select:{code:true,title:true}},_count:{select:{questions:true}}},orderBy:{title:"asc"}});
  const recent=await db.testAttempt.findMany({where:{userId:user.id},take:12,orderBy:{startedAt:"desc"},
   select:{id:true,title:true,kind:true,status:true,startedAt:true,deadlineAt:true,score:true,possibleMarks:true}});
  return NextResponse.json({tests:tests.map(t=>({id:t.id,title:t.title,kind:t.kind,description:t.description,durationMinutes:t.durationMinutes,
    course:t.course,questionCount:t._count.questions,officialPatternVerified:t.officialPatternVerified})),recent},
   {headers:{"Cache-Control":"no-store"}});
 }catch(e){return failure(e)}
}
export async function POST(request:Request){
 const user=await apiUser();if(!user)return unauthorized();
 const body=await jsonBody(request);
 const kind=asString(body?.kind,20),templateId=asString(body?.templateId,100);
 const courseCode=asString(body?.courseCode,50),unit=Number(body?.unit||0),count=Number(body?.count||10),minutes=Number(body?.minutes||30);
 if(!["UNIT","MSE","ESE","FULL","SPEED","CUSTOM","MISTAKES"].includes(kind)||!Number.isInteger(count)||count<1||count>60||
   !Number.isInteger(minutes)||minutes<5||minutes>180||unit<0||unit>8)return bad("Invalid test settings");
 try{
  let questionIds:string[]=[],title="";
  if(templateId){
   const template=await db.testTemplate.findFirst({where:{id:templateId,published:true},
    include:{questions:{orderBy:{position:"asc"},select:{questionId:true}}}});
   if(!template)return bad("Test not found");
   title=template.title;questionIds=template.questions.map(q=>q.questionId);
  }else if(kind==="MISTAKES"){
   const missed=await db.practiceLog.findMany({where:{userId:user.id,correct:false},orderBy:{answeredAt:"desc"},take:250,select:{questionId:true}});
   const inTests=await db.attemptQuestion.findMany({where:{attempt:{userId:user.id,status:"SUBMITTED"},response:{not:null}},include:{question:true},take:300});
   const fromTests=inTests.filter(x=>!x.response||x.question.correctAnswer.trim().toLowerCase()!==x.response.trim().toLowerCase()).map(x=>x.questionId);
   questionIds=[...new Set([...missed.map(q=>q.questionId),...fromTests])].slice(0,count);
   title="Re-attempt my mistakes";
  }else{
   const chapters=Array.isArray(body?.unitIds)?body.unitIds.filter((v:unknown)=>typeof v==="string").slice(0,15):[];
   const candidates=await db.question.findMany({where:{
    ...(courseCode?{course:{code:courseCode}}:{}),...(unit?{unit:{number:unit}}:{}),
    ...(chapters.length?{unitId:{in:chapters}}:{})
   },select:{id:true},take:300});
   const ids=candidates.map(q=>q.id);
   for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
   questionIds=ids.slice(0,count);title=kind==="UNIT"?"Unit-Wise Practice Mock":kind==="SPEED"?"Timed Speed Challenge":"Custom VIT-Style Mock";
  }
  if(!questionIds.length)return NextResponse.json({error:"No available questions for the selected test. Expand the filter."},{status:409});
  const durationSeconds=templateId?(await db.testTemplate.findUnique({where:{id:templateId},select:{durationMinutes:true}}))!.durationMinutes*60:minutes*60;
  const attempt=await db.testAttempt.create({data:{
   userId:user.id,title,kind:kind as TestKind,templateId:templateId||null,durationSeconds,
   deadlineAt:new Date(Date.now()+durationSeconds*1000),
   items:{create:questionIds.map((questionId,position)=>({questionId,position}))}
  },select:{id:true,title:true,deadlineAt:true}});
  return NextResponse.json({attempt,questionCount:questionIds.length},{status:201});
 }catch(e){return failure(e)}
}
