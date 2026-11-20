import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {apiUser,unauthorized,failure} from "@/lib/api";
import {checkAnswer,pointFor,quadrant,performanceLabel} from "@/lib/scoring";
type Params={params:Promise<{id:string}>};
export async function GET(_:Request,{params}:Params){
 const user=await apiUser();if(!user)return unauthorized();
 const {id}=await params;
 try{
  const attempt=await db.testAttempt.findFirst({where:{id,userId:user.id,status:"SUBMITTED"},
   include:{items:{orderBy:{position:"asc"},include:{question:{include:{
    course:{select:{code:true,title:true}},unit:{select:{number:true,title:true,coCode:true}},topic:{select:{title:true}}}}}}}});
  if(!attempt)return NextResponse.json({error:"Submitted attempt not found"},{status:404});
  const items=attempt.items.map(item=>{
   const q=item.question,objective=q.type!=="SUBJECTIVE",correct=objective&&checkAnswer(q.type,q.correctAnswer,item.response);
   return {id:item.id,questionId:q.id,courseCode:q.course.code,courseTitle:q.course.title,unit:q.unit.number,
    unitTitle:q.unit.title,topic:q.topic?.title||q.unit.title,coCode:q.coCode||q.unit.coCode,
    type:q.type,stem:q.stem,code:q.code,options:q.options,diagramUrl:q.diagramUrl,
    response:item.response,correctAnswer:q.correctAnswer,correct,solution:q.solution,concept:q.concept,
    rubric:q.rubric,marks:objective?pointFor(q,item.response):0,selfMarks:item.selfMarks,
    maxMarks:q.maxMarks,objective,timeSeconds:item.timeSeconds,idealSeconds:q.idealSeconds,
    visits:item.visits,answerChanges:item.answerChanges,marked:item.bookmarkedForReview,
    attempted:Boolean(item.response?.trim()),quadrant:item.response?.trim()&&objective?quadrant(correct,item.timeSeconds,q.idealSeconds):null};
  });
  const objectives=items.filter(i=>i.objective),attempted=objectives.filter(i=>i.attempted).length;
  const unitMap=new Map<string,{code:string;unit:number;title:string;coCode:string|null;earned:number;possible:number;time:number;attempted:number;correct:number}>();
  const subjectMap=new Map<string,{code:string;title:string;earned:number;possible:number;time:number;attempted:number;correct:number}>();
  for(const item of items){
   const k=item.courseCode+"-"+item.unit;
   const u=unitMap.get(k)||{code:item.courseCode,unit:item.unit,title:item.unitTitle,coCode:item.coCode,earned:0,possible:0,time:0,attempted:0,correct:0};
   const s=subjectMap.get(item.courseCode)||{code:item.courseCode,title:item.courseTitle,earned:0,possible:0,time:0,attempted:0,correct:0};
   u.earned+=item.marks;s.earned+=item.marks;u.possible+=item.objective?item.maxMarks:0;s.possible+=item.objective?item.maxMarks:0;
   u.time+=item.timeSeconds;s.time+=item.timeSeconds;u.attempted+=item.attempted?1:0;s.attempted+=item.attempted?1:0;
   u.correct+=item.correct?1:0;s.correct+=item.correct?1:0;unitMap.set(k,u);subjectMap.set(item.courseCode,s);
  }
  const units=[...unitMap.values()],subjects=[...subjectMap.values()];
  const weak=units.map(u=>({...u,lost:u.possible-Math.max(0,u.earned)})).sort((a,b)=>b.lost-a.lost).slice(0,3);
  const mistakes=items.filter(i=>i.objective&&i.attempted&&!i.correct);
  const quadrants=["Fast / Accurate","Overtime / Accurate","Fast / Incorrect","Overtime / Incorrect"].map(name=>({
   name,count:items.filter(i=>i.quadrant===name).length}));
  const score=attempt.score||0,max=attempt.possibleMarks||0,positive=items.filter(i=>i.marks>0).reduce((s,i)=>s+i.marks,0);
  const penalty=-items.filter(i=>i.marks<0).reduce((s,i)=>s+i.marks,0);
  return NextResponse.json({
   attempt:{id:attempt.id,title:attempt.title,kind:attempt.kind,score,max,positive,penalty,
    accuracy:attempt.accuracy||0,attempted,objectiveCount:objectives.length,
    total:items.length,attemptRate:objectives.length?attempted/objectives.length*100:0,
    timeSeconds:items.reduce((s,i)=>s+i.timeSeconds,0),durationSeconds:attempt.durationSeconds,
    status:attempt.status,startedAt:attempt.startedAt,submittedAt:attempt.submittedAt,
    performance:performanceLabel(Math.max(0,score)/Math.max(1,max))},
   items,units,subjects,weak,quadrants,mistakeCount:mistakes.length,
   caveat:"Objective scores are verified by this practice engine. Descriptive marks are self-assessed and excluded. No official VIT grading policy or peer percentile is inferred."},
   {headers:{"Cache-Control":"no-store"}});
 }catch(e){return failure(e)}
}
