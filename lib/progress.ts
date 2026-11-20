import {db} from "@/lib/db";
export async function registerPractice(userId:string,questionId:string,response:string,correct:boolean){
 await db.$transaction(async tx=>{
  await tx.practiceLog.create({data:{userId,questionId,response,correct}});
  await tx.userPreference.upsert({where:{userId},create:{userId,totalXp:correct?10:3,lastPracticeAt:new Date()},
   update:{totalXp:{increment:correct?10:3},lastPracticeAt:new Date()}});
 });
}
export function getDayInIndia(value:Date){return value.toLocaleDateString("en-CA",{timeZone:"Asia/Kolkata"});}
export function dailyStreak(dates:Date[]){
 const days=new Set(dates.map(getDayInIndia));let count=0;
 for(let d=0;d<365;d++){
  const date=new Date(Date.now()-d*86400000),stamp=getDayInIndia(date);
  if(days.has(stamp))count++;else if(d===0)continue;else break;
 }
 return count;
}
