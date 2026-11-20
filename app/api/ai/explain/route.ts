import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {apiUser,unauthorized,bad,failure,jsonBody,asString} from "@/lib/api";
export async function POST(request:Request){
 const user=await apiUser();if(!user)return unauthorized();
 const b=await jsonBody(request),attemptId=asString(b?.attemptId,100),itemId=asString(b?.itemId,100);
 if(!attemptId||!itemId)return bad("A submitted attempt question is required");
 try{
  const item=await db.attemptQuestion.findFirst({where:{id:itemId,attempt:{id:attemptId,userId:user.id,status:"SUBMITTED"}},
   include:{question:true}});
  if(!item)return bad("This question is not available for explanation");
  const q=item.question;
  if(process.env.OPENAI_API_KEY){
   try{
    const response=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",
     headers:{"Content-Type":"application/json",Authorization:"Bearer "+process.env.OPENAI_API_KEY},
     body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-4.1-mini",temperature:.25,max_tokens:450,messages:[
      {role:"system",content:"You are a respectful Socratic engineering tutor. Explain misconceptions from a wrong answer. Ground only in the supplied verified question data. Do not invent institutional grading facts. Ask one reflective question and provide a compact learning step."},
      {role:"user",content:"Question: "+q.stem+"\nStudent response: "+(item.response||"Unanswered")+"\nCorrect response: "+q.correctAnswer+"\nKnown solution: "+q.solution+"\nConcept: "+(q.concept||"")}
     ]})});
    if(response.ok){const data=await response.json();const text=data.choices?.[0]?.message?.content;
     if(text)return NextResponse.json({explanation:text,ai:true});}
   }catch(error){console.error("Tutor temporarily unavailable",error instanceof Error?error.message:"unknown");}
  }
  const explanation="Your response: "+(item.response||"not attempted")+". The expected answer is "+q.correctAnswer+
   ". Key idea: "+(q.concept||"Review the method.")+" Step-by-step: "+q.solution+
   " Reflect: which assumption or calculation led you away from this result?";
  return NextResponse.json({explanation,ai:false,note:"Rule-based explanation; configure OPENAI_API_KEY for adaptive AI tutoring."});
 }catch(e){return failure(e)}
}
