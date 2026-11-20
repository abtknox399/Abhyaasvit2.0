import {NextResponse} from "next/server";
import {apiUser,unauthorized,bad,failure,jsonBody} from "@/lib/api";
import {db} from "@/lib/db";
import {dailyStreak,getDayInIndia} from "@/lib/progress";
export async function GET(){
 const user=await apiUser();if(!user)return unauthorized();
 try{
  const [pref,practice,attempts,bookmarks,courses,events]=await Promise.all([
   db.userPreference.findUnique({where:{userId:user.id}}),
   db.practiceLog.findMany({where:{userId:user.id},select:{questionId:true,correct:true,answeredAt:true,question:{select:{courseId:true,unitId:true}}},orderBy:{answeredAt:"desc"},take:3000}),
   db.testAttempt.findMany({where:{userId:user.id},orderBy:{startedAt:"desc"},take:6,select:{id:true,title:true,kind:true,status:true,score:true,possibleMarks:true,startedAt:true,deadlineAt:true}}),
   db.revisionBookmark.count({where:{userId:user.id}}),
   db.course.findMany({where:{year:user.studyYear},select:{id:true,code:true,title:true,units:{select:{id:true,_count:{select:{questions:true}}}}}}),
   db.examScheduleEvent.findMany({where:{officialVerified:true,academicYear:user.academicYear,semester:user.semester,
    OR:[{branch:"ALL"},{branch:user.branch}],startsAt:{gte:new Date()}},orderBy:{startsAt:"asc"},take:4})
  ]);
  const today=getDayInIndia(new Date()),solvedToday=new Set(practice.filter(q=>getDayInIndia(q.answeredAt)===today).map(q=>q.questionId)).size;
  const completed=practice.filter(q=>q.correct).length;
  const overview=courses.map(c=>{
   const logs=practice.filter(p=>p.question.courseId===c.id),correct=logs.filter(p=>p.correct).length;
   return {id:c.id,code:c.code,title:c.title,solved:new Set(logs.map(p=>p.questionId)).size,
    questionCount:c.units.reduce((s,u)=>s+u._count.questions,0),
    accuracy:logs.length?Math.round(correct/logs.length*100):null};
  });
  return NextResponse.json({user,goal:pref?.dailyGoal||20,xp:pref?.totalXp||0,streak:dailyStreak(practice.map(p=>p.answeredAt)),
   solvedToday,completed,bookmarks,accuracy:practice.length?Math.round(completed/practice.length*100):null,
   subjects:overview,recent:attempts,upcoming:events},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return failure(e)}
}
export async function PATCH(request:Request){
 const user=await apiUser();if(!user)return unauthorized();
 const body=await jsonBody(request),dailyGoal=Number(body?.dailyGoal);
 if(!Number.isInteger(dailyGoal)||dailyGoal<1||dailyGoal>500)return bad("Daily goal must be 1–500");
 try{await db.userPreference.upsert({where:{userId:user.id},create:{userId:user.id,dailyGoal},update:{dailyGoal}});
  return NextResponse.json({ok:true,dailyGoal});}catch(e){return failure(e)}
}
