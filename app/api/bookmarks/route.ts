import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {apiUser,unauthorized,bad,failure,jsonBody,asString} from "@/lib/api";
export async function GET(){
 const user=await apiUser();if(!user)return unauthorized();
 try{
  const bookmarks=await db.revisionBookmark.findMany({where:{userId:user.id},orderBy:{dueAt:"asc"},take:300,
   include:{question:{include:{course:{select:{code:true,title:true}},unit:{select:{number:true,title:true}}}}}});
  return NextResponse.json({bookmarks:bookmarks.map(b=>({id:b.id,questionId:b.questionId,tags:b.tags,note:b.note,
   dueAt:b.dueAt,intervalDays:b.intervalDays,ease:b.ease,question:{
    stem:b.question.stem,code:b.question.code,courseCode:b.question.course.code,courseTitle:b.question.course.title,
    unit:b.question.unit.number,unitTitle:b.question.unit.title,source:b.question.source}}))},
   {headers:{"Cache-Control":"no-store"}});
 }catch(e){return failure(e)}
}
export async function POST(request:Request){
 const user=await apiUser();if(!user)return unauthorized();
 const body=await jsonBody(request),questionId=asString(body?.questionId,100),note=asString(body?.note,1500);
 const tags=Array.isArray(body?.tags)?[...new Set(body.tags.filter((t:unknown)=>typeof t==="string").map((t:string)=>t.replace(/[^A-Za-z0-9_-]/g,"").slice(0,30)))].slice(0,8):[];
 if(!questionId)return bad("Question is required");
 try{
  const q=await db.question.findUnique({where:{id:questionId}});if(!q)return bad("Unknown question");
  const b=await db.revisionBookmark.upsert({where:{userId_questionId:{userId:user.id,questionId}},
   create:{userId:user.id,questionId,note,tags},update:{note,tags}});
  await db.flashcard.create({data:{userId:user.id,questionId,front:q.stem,back:q.concept||q.solution}}).catch(()=>{});
  return NextResponse.json({ok:true,id:b.id});
 }catch(e){return failure(e)}
}
export async function PATCH(request:Request){
 const user=await apiUser();if(!user)return unauthorized();
 const body=await jsonBody(request),id=asString(body?.id,100),quality=Number(body?.quality);
 if(!id||!Number.isInteger(quality)||quality<0||quality>5)return bad("Invalid review grade");
 try{
  const bookmark=await db.revisionBookmark.findFirst({where:{id,userId:user.id}});
  if(!bookmark)return bad("Bookmark not found");
  const interval=quality<3?1:quality===3?Math.max(2,bookmark.intervalDays*2):Math.max(3,Math.round(bookmark.intervalDays*bookmark.ease));
  const ease=Math.max(1.3,bookmark.ease+.1-(5-quality)*(.08+(5-quality)*.02));
  await db.revisionBookmark.update({where:{id},data:{dueAt:new Date(Date.now()+interval*86400000),intervalDays:interval,ease}});
  return NextResponse.json({ok:true,nextDueDays:interval});
 }catch(e){return failure(e)}
}
export async function DELETE(request:Request){
 const user=await apiUser();if(!user)return unauthorized();
 const body=await jsonBody(request),id=asString(body?.id,100);
 if(!id)return bad("Bookmark ID required");
 try{await db.revisionBookmark.deleteMany({where:{id,userId:user.id}});return NextResponse.json({ok:true})}catch(e){return failure(e)}
}
