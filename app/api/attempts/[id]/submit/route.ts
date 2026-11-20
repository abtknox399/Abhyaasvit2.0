import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {apiUser,unauthorized,failure} from "@/lib/api";
import {checkAnswer,pointFor} from "@/lib/scoring";
type Params={params:Promise<{id:string}>};
export async function POST(_:Request,{params}:Params){
 const user=await apiUser();if(!user)return unauthorized();
 const {id}=await params;
 try{
  const attempt=await db.testAttempt.findFirst({where:{id,userId:user.id},
   include:{items:{include:{question:true}}}});
  if(!attempt)return NextResponse.json({error:"Attempt not found"},{status:404});
  if(attempt.status==="SUBMITTED")return NextResponse.json({ok:true,alreadySubmitted:true});
  let score=0,possible=0,attempted=0,correct=0;
  for(const item of attempt.items){
   if(item.question.type!=="SUBJECTIVE"){
    score+=pointFor(item.question,item.response);possible+=item.question.maxMarks;
    if(item.response?.trim())attempted++;
    if(checkAnswer(item.question.type,item.question.correctAnswer,item.response))correct++;
   }
  }
  const changed=await db.testAttempt.updateMany({where:{id,userId:user.id,status:"IN_PROGRESS"},
   data:{status:"SUBMITTED",submittedAt:new Date(),score,possibleMarks:possible,
    accuracy:attempted?correct/attempted*100:0}});
  if(changed.count){
   await db.userPreference.upsert({where:{userId:user.id},
    create:{userId:user.id,totalXp:correct*10,lastPracticeAt:new Date()},
    update:{totalXp:{increment:correct*10},lastPracticeAt:new Date()}});
  }
  return NextResponse.json({ok:true,score,possible,attempted,correct});
 }catch(e){return failure(e)}
}
