import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {apiUser,unauthorized,bad,failure,jsonBody,asString} from "@/lib/api";
export async function GET(){
 const user=await apiUser();if(!user)return unauthorized();
 try{
  const cards=await db.flashcard.findMany({where:{userId:user.id},orderBy:{dueAt:"asc"},take:200});
  return NextResponse.json({cards,dueToday:cards.filter(c=>c.dueAt<=new Date()).length},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return failure(e)}
}
export async function POST(request:Request){
 const user=await apiUser();if(!user)return unauthorized();
 const body=await jsonBody(request),front=asString(body?.front,2000),back=asString(body?.back,3500);
 if(!front||!back)return bad("Front and back are required");
 try{const card=await db.flashcard.create({data:{userId:user.id,front,back}});return NextResponse.json({card},{status:201})}catch(e){return failure(e)}
}
export async function PATCH(request:Request){
 const user=await apiUser();if(!user)return unauthorized();
 const body=await jsonBody(request),id=asString(body?.id,100),quality=Number(body?.quality);
 if(!id||!Number.isInteger(quality)||quality<0||quality>5)return bad("Rate recall between 0 and 5");
 try{
  const card=await db.flashcard.findFirst({where:{id,userId:user.id}});if(!card)return bad("Flashcard unavailable");
  const ease=Math.max(1.3,card.ease+.1-(5-quality)*(.08+(5-quality)*.02));
  const interval=quality<3?1:card.reviews===0?1:card.reviews===1?6:Math.max(1,Math.round(card.intervalDays*ease));
  await db.flashcard.update({where:{id},data:{ease,intervalDays:interval,reviews:{increment:1},dueAt:new Date(Date.now()+interval*86400000)}});
  return NextResponse.json({ok:true,intervalDays:interval});
 }catch(e){return failure(e)}
}
