import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {apiUser,unauthorized,bad,failure,jsonBody,asString} from "@/lib/api";
type Params={params:Promise<{id:string}>};
export async function POST(request:Request,{params}:Params){
 const user=await apiUser();if(!user)return unauthorized();
 const {id}=await params,body=await jsonBody(request);
 const itemId=asString(body?.itemId,100),marks=Number(body?.marks);
 if(!itemId||!Number.isFinite(marks)||marks<0)return bad("Invalid rubric score");
 try{
  const item=await db.attemptQuestion.findFirst({where:{id:itemId,attempt:{id,userId:user.id,status:"SUBMITTED"}},include:{question:true}});
  if(!item||item.question.type!=="SUBJECTIVE"||marks>item.question.maxMarks)return bad("Rubric score outside allowed range");
  await db.attemptQuestion.update({where:{id:itemId},data:{selfMarks:marks}});
  return NextResponse.json({ok:true,selfReported:true,marks});
 }catch(e){return failure(e)}
}
