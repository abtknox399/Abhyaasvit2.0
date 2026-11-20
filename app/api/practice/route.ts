import {NextRequest,NextResponse} from "next/server";
import {apiUser,unauthorized,bad,jsonBody,asString,failure} from "@/lib/api";
import {db} from "@/lib/db";
import {presentQuestion,questionInclude} from "@/lib/queries";
import {checkAnswer} from "@/lib/scoring";
import {registerPractice} from "@/lib/progress";
export async function GET(request:NextRequest){
 const user=await apiUser();if(!user)return unauthorized();
 const p=request.nextUrl.searchParams,courseCode=p.get("course")||undefined,unit=Number(p.get("unit"))||0,source=p.get("source")||undefined;
 const difficulty=p.get("difficulty")||undefined,format=p.get("format")||undefined,topicId=p.get("topic")||undefined;
 try{
  const rows=await db.question.findMany({where:{
   ...(courseCode?{course:{code:courseCode}}:{}),...(unit?{unit:{number:unit}}:{}),
   ...(topicId?{topicId}:{}),
   ...(source?{source:source as "ORIGINAL_DEMO"}:{}),
   ...(difficulty?{difficulty:difficulty as "EASY"}:{}),
   ...(format?{type:format as "MCQ"}:{})
  },include:questionInclude,take:150,orderBy:[{unit:{number:"asc"}},{createdAt:"asc"}]});
  return NextResponse.json({questions:rows.map(presentQuestion)},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return failure(e)}
}
export async function POST(request:Request){
 const user=await apiUser();if(!user)return unauthorized();
 const body=await jsonBody(request),questionId=asString(body?.questionId,80),response=asString(body?.response,250);
 if(!questionId||!response)return bad("Select a question and provide an answer");
 try{
  const q=await db.question.findUnique({where:{id:questionId}});
  if(!q)return bad("Unknown question");
  if(q.type==="SUBJECTIVE")return bad("Use the theory mock rubric to assess descriptive answers.");
  if(q.type==="MCQ"&&!/^[A-D]$/i.test(response))return bad("Select an MCQ option");
  const correct=checkAnswer(q.type,q.correctAnswer,response);
  await registerPractice(user.id,q.id,response,correct);
  return NextResponse.json({correct,correctAnswer:q.correctAnswer,solution:q.solution,concept:q.concept,xp:correct?10:3});
 }catch(e){return failure(e)}
}
