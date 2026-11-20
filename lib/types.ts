export type SafeQuestion={
 id:string;courseCode:string;unitNumber:number;unitTitle:string;topic:string;coCode:string|null;
 type:"MCQ"|"NUMERICAL"|"CODE_OUTPUT"|"SUBJECTIVE";source:string;verified:boolean;
 stem:string;code:string|null;diagramUrl:string|null;options:{id:string;text:string}[]|null;
 maxMarks:number;idealSeconds:number;difficulty:string
};
export type CatalogCourse={id:string;code:string;title:string;year:number;semester:number;module:string;branch:string;officialVerified:boolean;
 units:{id:string;number:number;section:string;title:string;coCode:string|null;topics:{id:string;title:string;priority:string}[];questionCount:number}[]};
export type AttemptItem={id:string;question:SafeQuestion;position:number;response:string|null;visited:boolean;bookmarkedForReview:boolean;visits:number;timeSeconds:number;answerChanges:number};
export type AttemptView={id:string;title:string;kind:string;startedAt:string;deadlineAt:string;status:string;durationSeconds:number;items:AttemptItem[]};
export async function getJson<T>(url:string,options?:RequestInit):Promise<T>{
 const response=await fetch(url,{cache:"no-store",...options});const body=await response.json().catch(()=>({error:"Unexpected server response"}));
 if(!response.ok)throw new Error(body.error||"Request failed");return body as T;
}
export function reqJson(data:unknown,method="POST"):RequestInit{
 return {method,headers:{"Content-Type":"application/json"},body:JSON.stringify(data)};
}
export function formatTimer(seconds:number){
 const s=Math.max(0,Math.floor(seconds));const p=(x:number)=>String(x).padStart(2,"0");
 return p(Math.floor(s/3600))+":"+p(Math.floor(s%3600/60))+":"+p(s%60);
}
