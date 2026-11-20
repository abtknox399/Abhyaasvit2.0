export type DraftUnit={number:number;title:string;topics:string[]};
export type ParsedSyllabus={title:string;subjects:{code:string;name:string;units:DraftUnit[]}[];warnings:string[]};
export function parseSyllabus(raw:string,title:string):ParsedSyllabus{
 const lines=raw.replace(/\r/g,"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
 const subjects:{code:string;name:string;units:DraftUnit[]}[]=[];
 let current={code:"UNVERIFIED",name:title,units:[] as DraftUnit[]};
 subjects.push(current);let active:DraftUnit|null=null;
 for(const line of lines){
  const course=line.match(/^([A-Z]{2}\d{5})\s*[-:–]\s*(.+)$/);
  if(course&&line.length<160){
   current={code:course[1],name:course[2],units:[]};subjects.push(current);active=null;continue;
  }
  const match=line.match(/^(?:UNIT|Unit|Module|MODULE)\s*[-.:]?\s*(\d+|[IVX]+)\s*[:.)–-]?\s*(.*)$/);
  if(match){
   const roman:{[key:string]:number}={I:1,II:2,III:3,IV:4,V:5,VI:6};
   const number=Number(match[1])||roman[match[1].toUpperCase()]||current.units.length+1;
   active={number,title:match[2]||"Unit "+number,topics:[]};
   current.units.push(active);continue;
  }
  if(active&&line.length>3&&line.length<300)active.topics.push(line);
 }
 // Keep output small, reviewed and editable. Do not claim exhaustive PDF extraction.
 const nonempty=subjects.filter(s=>s.units.length);
 return {title,subjects:nonempty.length?nonempty:[{code:"UNVERIFIED",name:title,
  units:[{number:1,title:"Unstructured syllabus (requires manual review)",topics:lines.slice(0,35)}]}]},
 warnings:["This is a draft extraction, not an official syllabus verification.","Check unit boundaries, topics, and source documents before publishing."]};
}
export function basicStudyKit(syllabus:ParsedSyllabus){
 const questions=syllabus.subjects.flatMap(s=>s.units.slice(0,6).map(u=>({
  unit:u.number,subject:s.name,kind:"DRAFT_QUESTION",question:"Explain the central idea of "+u.title+".",
  solution:"Draft only. Add a teacher-reviewed marking rubric and supporting source before release."})));
 const notes=syllabus.subjects.flatMap(s=>s.units.slice(0,6).map(u=>({
  unit:u.number,subject:s.name,summary:u.title+": "+u.topics.slice(0,5).join("; "),
  status:"Outline extracted; not AI-generated or fact-checked."})));
 return {questions,notes,formulaSheets:[] as {unit:number;latex:string}[],
  source:"Deterministic draft generator; connect an AI provider for original generated materials."};
}
export async function aiStudyKit(rawText:string,syllabus:ParsedSyllabus){
 const token=process.env.OPENAI_API_KEY;
 if(!token)return {generated:basicStudyKit(syllabus),aiAssisted:false};
 try{
  const response=await fetch("https://api.openai.com/v1/chat/completions",{
   method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},
   body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-4.1-mini",temperature:.2,max_tokens:2400,
    response_format:{type:"json_object"},messages:[
     {role:"system",content:"Create a compact JSON OBJECT with arrays 'questions','notes','formulaSheets'. For each unit, produce 1 original non-copyright-infringing question, a solution rubric, a short note, and formulas only when relevant. Use ONLY supplied syllabus. Label all items draft; never label invented content as a real PYQ, official weightage or VIT policy. Output parseable JSON."},
     {role:"user",content:JSON.stringify({syllabus,raw:rawText.slice(0,14000)})}
    ]})});
  if(!response.ok)throw Error("Provider unavailable");
  const json=await response.json(),output=json?.choices?.[0]?.message?.content;
  if(!output)throw Error("Provider returned no content");
  return {generated:JSON.parse(output) as object,aiAssisted:true};
 }catch(e){
  console.error("AI draft generation unavailable",e instanceof Error?e.message:"unknown");
  return {generated:basicStudyKit(syllabus),aiAssisted:false};
 }
}
