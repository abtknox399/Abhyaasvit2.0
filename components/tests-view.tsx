"use client";
import {useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {ArrowRight,BookOpen,CalendarClock,CheckCircle2,Clock3,ClipboardList,Filter,Play,RotateCcw,Target,Timer} from "lucide-react";
import {getJson,reqJson,type CatalogCourse} from "@/lib/types";
type Test={id:string;title:string;kind:string;description:string;durationMinutes:number;course:{code:string;title:string}|null;questionCount:number;officialPatternVerified:boolean};
type Recent={id:string;title:string;kind:string;status:string;startedAt:string;deadlineAt:string;score:number|null;possibleMarks:number|null};
export function TestsView(){
 const router=useRouter(),[tests,setTests]=useState<Test[]>([]),[recent,setRecent]=useState<Recent[]>([]),[catalog,setCatalog]=useState<CatalogCourse[]>([]);
 const [kind,setKind]=useState("UNIT"),[course,setCourse]=useState("ES26101"),[units,setUnits]=useState<string[]>([]),[count,setCount]=useState(10),[minutes,setMinutes]=useState(30),[busy,setBusy]=useState(false),[error,setError]=useState("");
 useEffect(()=>{Promise.all([getJson<{tests:Test[];recent:Recent[]}>("/api/tests"),getJson<{courses:CatalogCourse[]}>("/api/catalog")])
  .then(([a,b])=>{setTests(a.tests);setRecent(a.recent);setCatalog(b.courses)}).catch(e=>setError(e.message))},[]);
 const selected=catalog.find(c=>c.code===course);
 const modeCards=[{id:"UNIT",title:"Unit-wise drills",sub:"Focus on a few syllabus units.",icon:Target,duration:30},
  {id:"MSE",title:"Mid-Sem mock",sub:"Section I university-style preparation.",icon:CalendarClock,duration:60},
  {id:"ESE",title:"End-Sem mock",sub:"Full syllabus exam rehearsal.",icon:ClipboardList,duration:120},
  {id:"SPEED",title:"Aptitude speed",sub:"Timed objective quick practice.",icon:Timer,duration:20},
  {id:"MISTAKES",title:"Re-attempt mistakes",sub:"Only your previous wrong questions.",icon:RotateCcw,duration:30}];
 function choose(id:string,duration:number){setKind(id);setMinutes(duration)}
 async function launch(args:{kind:string;templateId?:string;courseCode?:string;unitIds?:string[];count?:number;minutes?:number}){
  setBusy(true);setError("");
  try{const j=await getJson<{attempt:{id:string};questionCount:number}>("/api/tests",reqJson(args));
   router.push("/attempt/"+j.attempt.id);
  }catch(e){setError(e instanceof Error?e.message:"Could not start test")}finally{setBusy(false)}
 }
 return <div className="space-y-7">
  <header><p className="eyebrow">QUIZRR-STYLE EXAM WORKSPACE</p><h1 className="page-title mt-2">Mock Tests & CBT Simulator</h1>
   <p className="muted mt-2 text-sm">Create focused unit drills or sit a full timed simulation, then review what cost you marks.</p></header>
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{modeCards.map(({id,title,sub,icon:Icon,duration})=>
   <button type="button" key={id} onClick={()=>choose(id,duration)} className={"panel min-h-[145px] p-5 text-left transition hover:border-indigo-300 "+(kind===id?"!border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-950":"")}>
    <Icon className="text-indigo-600" size={22}/><h3 className="mt-4 text-sm font-extrabold">{title}</h3><p className="muted mt-1 text-xs leading-5">{sub}</p></button>)}</div>
  <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
   <section className="panel p-6"><div className="flex items-center gap-2"><Filter className="text-indigo-600" size={19}/><h2 className="section-title">Build your next test</h2></div>
    <p className="muted mt-2 text-xs">These are original practice simulations. Exact institutional marking and timings must be verified before being labelled official.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
     <label className="text-xs font-bold">Course<select className="field mt-2" value={course} onChange={e=>{setCourse(e.target.value);setUnits([])}}>
      {catalog.map(c=><option key={c.id} value={c.code}>{c.code} · {c.title}</option>)}</select></label>
     <label className="text-xs font-bold">Question count<input className="field mt-2" type="number" min={1} max={60} value={count} onChange={e=>setCount(Number(e.target.value))}/></label>
     <label className="text-xs font-bold">Duration (minutes)<input className="field mt-2" type="number" min={5} max={180} value={minutes} onChange={e=>setMinutes(Number(e.target.value))}/></label>
     <label className="text-xs font-bold">Test format<input className="field mt-2" readOnly value={kind==="MISTAKES"?"Previously incorrect":kind+" · Original questions"}/></label>
    </div>
    {kind!=="MISTAKES"&&<div className="mt-5"><h3 className="mb-3 text-xs font-bold">Select units (optional)</h3><div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">{selected?.units.map(u=>
     <label key={u.id} className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-3 text-xs dark:border-slate-700">
      <input type="checkbox" className="accent-indigo-600" checked={units.includes(u.id)} onChange={()=>setUnits(v=>v.includes(u.id)?v.filter(x=>x!==u.id):[...v,u.id])}/>
      <span className="line-clamp-2">Unit {u.number}: {u.title}</span></label>)}</div></div>}
    <button disabled={busy} className="btn-primary mt-6" onClick={()=>launch({kind,courseCode:kind==="MISTAKES"?undefined:course,
     unitIds:units,count,minutes})}>{busy?"Preparing…":"Launch CBT"} <Play size={17}/></button>
   </section>
   <section className="panel p-6"><h2 className="section-title">Your recent tests</h2><p className="muted mt-1 text-xs">Resume unsent attempts or inspect completed reports.</p>
    <div className="mt-5 space-y-2">{recent.map(a=><Link key={a.id} href={a.status==="SUBMITTED"?"/analytics/"+a.id:"/attempt/"+a.id}
     className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 p-3 hover:bg-indigo-50 dark:border-slate-700 dark:hover:bg-slate-800">
     <div className="min-w-0"><p className="truncate text-xs font-bold">{a.title}</p><p className="muted mt-1 text-[11px]">{a.status==="SUBMITTED"?"Score "+a.score+"/"+a.possibleMarks:"Continue exam"} · {new Date(a.startedAt).toLocaleDateString("en-IN")}</p></div><ArrowRight size={16}/></Link>)}
     {!recent.length&&<p className="rounded-xl bg-slate-50 p-4 text-sm muted dark:bg-slate-800">Your first mock is ready when you are.</p>}</div>
   </section>
  </div>
  <section className="panel p-6"><div className="mb-4 flex items-center justify-between"><h2 className="section-title">Ready-to-attempt mock papers</h2><span className="tag">original demos</span></div>
   <div className="grid gap-3 md:grid-cols-2">{tests.map(t=><article key={t.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
    <div className="flex flex-wrap items-center justify-between gap-2"><span className="tag">{t.kind}</span><span className="muted flex items-center gap-1 text-xs"><Clock3 size={13}/>{t.durationMinutes} min · {t.questionCount} questions</span></div>
    <h3 className="mt-3 text-sm font-extrabold">{t.title}</h3><p className="muted mt-2 text-xs leading-5">{t.description}</p>
    <button disabled={busy} onClick={()=>launch({kind:t.kind,templateId:t.id,count:t.questionCount,minutes:t.durationMinutes})}
     className="mt-4 flex items-center gap-1 text-xs font-extrabold text-indigo-600">Start test <ArrowRight size={15}/></button>
   </article>)}</div>
  </section>
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
 </div>;
}
