"use client";
import {useEffect,useState} from "react";
import {CheckCircle2,FileCheck2,FolderPlus,ShieldAlert} from "lucide-react";
import {getJson,reqJson,type CatalogCourse} from "@/lib/types";
type Draft={questions?:unknown};
const example={
 unit:1,type:"MCQ",stem:"Which technique reduces a matrix to row echelon form?",
 options:[{id:"A",text:"Gauss elimination"},{id:"B",text:"Monte Carlo"},{id:"C",text:"Integration by parts"},{id:"D",text:"Heap sort"}],
 correctAnswer:"A",solution:"Gaussian elimination uses elementary row operations to reach echelon form.",
 concept:"Elementary row operations preserve rank.",topic:"Row echelon form",maxMarks:4,idealSeconds:120
};
export function StudioPublishPanel({id,generated,status,role,onUpdated}:{id:string;generated:unknown;status:string;role:string;onUpdated:()=>void}){
 const [state,setState]=useState(status),[course,setCourse]=useState("ES26101"),[courses,setCourses]=useState<CatalogCourse[]>([]),
  [questions,setQuestions]=useState(JSON.stringify((generated as Draft|null)?.questions||[],null,2)),
  [busy,setBusy]=useState(false),[notice,setNotice]=useState("");
 useEffect(()=>{getJson<{courses:CatalogCourse[]}>("/api/catalog").then(x=>setCourses(x.courses)).catch(()=>{})},[]);
 useEffect(()=>{setState(status);setQuestions(JSON.stringify((generated as Draft|null)?.questions||[],null,2))},[status,generated]);
 async function action(value:"review"|"sync-catalog"|"publish"){
  setBusy(true);setNotice("");
  try{
   let draft:unknown=undefined;
   if(value==="publish"){try{draft=JSON.parse(questions)}catch{throw Error("Question JSON is invalid.")}}
   const r=await getJson<{status?:string;units?:number;topicsAdded?:number;questions?:number}>("/api/studio/"+id,
    reqJson({action:value,courseCode:course,questions:draft},"PATCH"));
   if(r.status)setState(r.status);
   setNotice(value==="sync-catalog"?"Synced "+r.units+" syllabus units and added "+r.topicsAdded+" topics; official status remains unverified.":
    value==="publish"?"Published "+r.questions+" reviewed practice question(s) to "+course+". Not VIT PYQs.":
    "Draft marked reviewed. Administrator publication is required.");
   onUpdated();
  }catch(e){setNotice(e instanceof Error?e.message:"Could not complete action")}finally{setBusy(false)}
 }
 if(state==="PUBLISHED")return <div className="mt-4 flex gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-xs text-green-800">
  <CheckCircle2 size={17}/>Published as reviewed practice, not an official university PYQ.</div>;
 return <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900 dark:bg-indigo-950/20">
  <div className="flex items-start justify-between"><div><h3 className="text-sm font-extrabold">Editorial review & publishing</h3>
   <p className="muted mt-1 text-xs">Status: {state}. Inspect solutions and answer keys before approval.</p></div>
   <ShieldAlert className="shrink-0 text-amber-600" size={20}/></div>
  {state!=="REVIEWED"&&<button disabled={busy} className="btn-secondary mt-3" onClick={()=>action("review")}>
   <FileCheck2 size={16}/>Mark source reviewed</button>}
  {role==="ADMIN"&&state==="REVIEWED"&&<>
   <label className="mt-4 block text-xs font-bold">Target course
    <select className="field mt-2" value={course} onChange={e=>setCourse(e.target.value)}>
     {courses.map(c=><option key={c.id} value={c.code}>{c.code} · {c.title}</option>)}</select></label>
   <div className="mt-4 flex flex-wrap items-center gap-2"><button disabled={busy} className="btn-secondary" onClick={()=>action("sync-catalog")}>
    <FolderPlus size={15}/>Sync reviewed syllabus units/topics</button><span className="muted text-xs">Existing unit names are preserved.</span></div>
   <label className="mt-4 block text-xs font-bold">Reviewed practice question JSON
    <textarea className="field mt-2 !font-mono !text-[11px]" rows={12} spellCheck={false} value={questions} onChange={e=>setQuestions(e.target.value)}/></label>
   <details className="mt-2"><summary className="cursor-pointer text-xs font-bold text-indigo-600">Valid four-option MCQ example</summary>
    <pre className="scrollbar-thin mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-[11px] dark:bg-slate-900">{JSON.stringify([example],null,2)}</pre></details>
   <p className="muted mt-3 text-xs">Publish 1–60 manually checked questions. MCQs need A–D; descriptive questions need stepwise rubrics. All are labelled AI_DRAFT, not official PYQs.</p>
   <button disabled={busy} className="btn-primary mt-4" onClick={()=>action("publish")}>
    <CheckCircle2 size={16}/>Publish reviewed practice</button>
  </>}
  {role!=="ADMIN"&&state==="REVIEWED"&&<p className="mt-3 text-xs font-bold text-indigo-700 dark:text-indigo-300">
   Awaiting administrator approval. This content is not visible in the student question bank.</p>}
  {notice&&<p role="status" className="mt-3 rounded-xl bg-white p-3 text-xs dark:bg-slate-900">{notice}</p>}
 </div>;
}
