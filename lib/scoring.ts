import type {Question,QuestionType} from "@prisma/client";
export const clean=(s:string|null|undefined)=>(s||"").trim().replace(/\s+/g," ").toLowerCase();
export function checkAnswer(type:QuestionType,expected:string,response:string|null|undefined){
 const a=clean(expected),b=clean(response);if(!b)return false;
 if(type==="SUBJECTIVE")return false;
 if(type==="NUMERICAL"){const n=Number(a),v=Number(b);return Number.isFinite(v)&&Number.isFinite(n)&&Math.abs(n-v)<1e-6}
 return a===b;
}
export function pointFor(q:Pick<Question,"type"|"maxMarks"|"negativeMarks"|"correctAnswer">,response:string|null|undefined){
 if(!response?.trim()||q.type==="SUBJECTIVE")return 0;
 return checkAnswer(q.type,q.correctAnswer,response)?q.maxMarks:-q.negativeMarks;
}
export function quadrant(correct:boolean,time:number,ideal:number){
 return (time<=ideal?"Fast":"Overtime")+" / "+(correct?"Accurate":"Incorrect");
}
export function performanceLabel(fraction:number){
 // Practice-only performance descriptor; not a verified VIT grade or CGPA calculation.
 if(fraction>=.9)return "Strong practice performance";
 if(fraction>=.75)return "On track for revision";
 if(fraction>=.5)return "Needs targeted practice";
 return "Rebuild fundamentals";
}
