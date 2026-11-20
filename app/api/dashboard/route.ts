import {NextResponse} from "next/server";
import {apiUser,unauthorized,bad,failure,jsonBody} from "@/lib/api";
import {db} from "@/lib/db";
import {dailyStreak,getDayInIndia} from "@/lib/progress";
import {checkAnswer} from "@/lib/scoring";
export async function GET(){
 const user=await apiUser();if(!user)return unauthorized();
 try{
  const [pref,practice,attempts,bookmarks,courses,events,cbtAttempts]=await Promise.all([
   db.userPreference.findUnique({where:{userId:user.id}}),
   db.practiceLog.findMany({where:{userId:user.id},select:{questionId:true,correct:true,answeredAt:true,question:{select:{courseId:true,unitId:true}}},orderBy:{answeredAt:"desc"},take:3000}),
   db.testAttempt.findMany({where:{userId:user.id},orderBy:{startedAt:"desc"},take:6,select:{id:true,title:true,kind:true,status:true,score:true,possibleMarks:true,startedAt:true,deadlineAt:true}}),
   db.revisionBookmark.count({where:{userId:user.id}}),
   db.course.findMany({where:{year:user.studyYear},select:{id:true,code:true,title:true,units:{select:{id:true,_count:{select:{questions:true}}}}}}),
   db.examScheduleEvent.findMany({where:{officialVerified:true,academicYear:user.academicYear,semester:user.semester,
    OR:[{branch:"ALL"},{branch:user.branch}],startsAt:{gte:new Date()}},orderBy:{startsAt:"asc"},take:4}),
   db.testAttempt.findMany({where:{userId:user.id,status:"SUBMITTED"},orderBy:{submittedAt:"desc"},take:150,
    select:{submittedAt:true,items:{select:{questionId:true,response:true,question:{
     select:{courseId:true,type:true,correctAnswer:true}}}}}})
  ]);
  // Completed CBT questions count toward daily goals and chapter progress too.
  const checkedCBT=cbtAttempts.flatMap(a=>a.items.filter(i=>i.response?.trim()&&i.question.type!=="SUBJECTIVE")
   .map(i=>({questionId:i.questionId,courseId:i.question.courseId,answeredAt:a.submittedAt!,
    correct:checkAnswer(i.question.type,i.question.correctAnswer,i.response)})));
  const today=getDayInIndia(new Date());
  const solvedToday=new Set([
   ...practice.filter(p=>getDayInIndia(p.answeredAt)===today).map(p=>p.questionId),
   ...checkedCBT.filter(p=>getDayInIndia(p.answeredAt)===today).map(p=>p.questionId)
  ]).size;
  const correctPractice=practice.filter(p=>p.correct).length;
  const correctCBT=checkedCBT.filter(p=>p.correct).length;
  const totalAnswered=practice.length+checkedCBT.length;
  const completed=correctPractice+correctCBT;
  const overview=courses.map(c=>{
   const logs=practice.filter(p=>p.question.courseId===c.id);
   const mocks=checkedCBT.filter(p=>p.courseId===c.id);
   const correct=logs.filter(p=>p.correct).length+mocks.filter(p=>p.correct).length;
   const attempts=logs.length+mocks.length;
   return {id:c.id,code:c.code,title:c.title,
    solved:new Set([...logs.map(p=>p.questionId),...mocks.map(p=>p.questionId)]).size,
    questionCount:c.units.reduce((sum,u)=>sum+u._count.questions,0),
    accuracy:attempts?Math.round(correct/attempts*100):null};
  });
  const activityDates=[...practice.map(p=>p.answeredAt),...checkedCBT.map(p=>p.answeredAt)];
  return NextResponse.json({user,goal:pref?.dailyGoal||20,xp:pref?.totalXp||0,streak:dailyStreak(activityDates),
   solvedToday,completed,bookmarks,accuracy:totalAnswered?Math.round(completed/totalAnswered*100):null,
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
