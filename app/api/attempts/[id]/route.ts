import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {apiUser,unauthorized,bad,failure,jsonBody,asString} from "@/lib/api";
import {presentQuestion,questionInclude} from "@/lib/queries";
type Params={params:Promise<{id:string}>};
export async function GET(_:Request,{params}:Params){
 const user=await apiUser();if(!user)return unauthorized();
 const {id}=await params;
 try{
  const attempt=await db.testAttempt.findFirst({where:{id,userId:user.id},
   include:{items:{orderBy:{position:"asc"},include:{question:{include:questionInclude}}}}});
  if(!attempt)return NextResponse.json({error:"Attempt not found"},{status:404});
  const view={id:attempt.id,title:attempt.title,kind:attempt.kind,startedAt:attempt.startedAt,
   deadlineAt:attempt.deadlineAt,status:attempt.status,durationSeconds:attempt.durationSeconds,
   items:attempt.items.map(i=>({id:i.id,position:i.position,question:presentQuestion(i.question),
    response:i.response,visited:i.visited,bookmarkedForReview:i.bookmarkedForReview,visits:i.visits,
    timeSeconds:i.timeSeconds,answerChanges:i.answerChanges}))};
  return NextResponse.json({attempt:view},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return failure(e)}
}
export async function PATCH(request:Request,{params}:Params){
 const user=await apiUser();if(!user)return unauthorized();
 const {id}=await params,body=await jsonBody(request);
 const itemId=asString(body?.itemId,100),action=asString(body?.action,20);
 if(!itemId||!["visit","save"].includes(action))return bad("Invalid question action");
 try{
  const attempt=await db.testAttempt.findFirst({where:{id,userId:user.id},include:{items:{where:{id:itemId},include:{question:{select:{type:true}}}}}});
  if(!attempt||!attempt.items.length)return NextResponse.json({error:"Question or attempt not found"},{status:404});
  if(attempt.status!=="IN_PROGRESS"||new Date()>attempt.deadlineAt)return NextResponse.json({error:"This attempt has ended; answers can no longer be edited."},{status:409});
  const item=attempt.items[0],now=new Date();
  if(action==="visit"){
   await db.attemptQuestion.update({where:{id:itemId},data:{visited:true,visits:{increment:1},lastViewedAt:now}});
   return NextResponse.json({ok:true});
  }
  const response=body?.response===null?null:typeof body?.response==="string"?body.response.trim().slice(0,5000):undefined;
  const marked=body?.marked;
  if(response===undefined||typeof marked!=="boolean")return bad("Invalid response or review flag");
  if(item.question.type==="MCQ"&&response&&!/^[A-D]$/i.test(response))return bad("Choose an MCQ option");
  if(item.question.type==="NUMERICAL"&&response&&!/^-?\d+(\.\d+)?$/.test(response))return bad("Enter a numerical answer");
  const elapsed=item.lastViewedAt?Math.min(300,Math.max(0,Math.floor((now.getTime()-item.lastViewedAt.getTime())/1000))):0;
  await db.attemptQuestion.update({where:{id:itemId},data:{
   response,bookmarkedForReview:marked,visited:true,
   timeSeconds:{increment:elapsed},lastViewedAt:now,savedAt:now,
   ...(item.response!==null&&item.response!==response?{answerChanges:{increment:1}}:{})
  }});
  return NextResponse.json({ok:true,savedAt:now},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return failure(e)}
}
