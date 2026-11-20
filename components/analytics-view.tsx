"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Activity,ArrowRight,BarChart3,BookmarkPlus,BrainCircuit,CheckCircle2,ChevronDown,ChevronUp,Clock3,Download,Flame,Lightbulb,RefreshCcw,Target,TrendingDown,TrendingUp,XCircle} from "lucide-react";
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,Legend,PieChart,Pie,Cell} from "recharts";
import {getJson,reqJson} from "@/lib/types";
import {MathText,CodeBlock} from "@/components/math";
type Answer={id:string;questionId:string;courseCode:string;courseTitle:string;unit:number;unitTitle:string;topic:string;coCode:string|null;
 type:string;stem:string;code:string|null;options:unknown;response:string|null;correctAnswer:string;correct:boolean;solution:string;concept:string|null;
 rubric:{step:string;marks:number}[]|null;marks:number;selfMarks:number|null;maxMarks:number;objective:boolean;timeSeconds:number;idealSeconds:number;
 visits:number;answerChanges:number;marked:boolean;attempted:boolean;quadrant:string|null};
type Summary={code:string;title?:string;unit?:number;coCode?:string|null;earned:number;possible:number;time:number;attempted:number;correct:number};
type Report={attempt:{id:string;title:string;kind:string;score:number;max:number;positive:number;penalty:number;accuracy:number;
 attempted:number;objectiveCount:number;total:number;attemptRate:number;timeSeconds:number;durationSeconds:number;performance:string;
 startedAt:string;submittedAt:string};items:Answer[];units:Summary[];subjects:Summary[];weak:(Summary&{lost:number})[];
 quadrants:{name:string;count:number}[];mistakeCount:number;caveat:string};
const colors=["#5266e5","#65bba9","#f3a653","#b78bea"];
const quadColors:{[key:string]:string}={"Fast / Accurate":"text-emerald-700 bg-emerald-50",
 "Overtime / Accurate":"text-indigo-700 bg-indigo-50","Fast / Incorrect":"text-orange-700 bg-orange-50",
 "Overtime / Incorrect":"text-rose-700 bg-rose-50"};
const filters=["All","Correct","Incorrect","Unattempted","Marked for review","Descriptive"];
function Stat({label,value,helper}:{label:string;value:string|number;helper?:string}){
 return <div className="panel p-5"><p className="muted text-[11px] font-semibold">{label}</p><p className="mt-2 text-2xl font-black">{value}</p>{helper&&<p className="muted mt-1 text-[11px]">{helper}</p>}</div>;
}
export function AnalyticsView({id}:{id:string}){
 const router=useRouter(),[data,setData]=useState<Report|null>(null),[error,setError]=useState("");
 const [filter,setFilter]=useState("All"),[expanded,setExpanded]=useState<string[]>([]),[grading,setGrading]=useState<{[key:string]:number}>({});
 const [aiText,setAiText]=useState<{[key:string]:string}>({}),[busy,setBusy]=useState(false),[notice,setNotice]=useState("");
 async function load(){try{const report=await getJson<Report>("/api/attempts/"+id+"/report");setData(report)}catch(e){setError(e instanceof Error?e.message:"Unable to load analytics")}}
 useEffect(()=>{load()},[id]);
 const rows=useMemo(()=>data?.items.filter(x=>filter==="All"||filter==="Correct"&&x.correct||filter==="Incorrect"&&x.objective&&x.attempted&&!x.correct||
  filter==="Unattempted"&&!x.attempted||filter==="Marked for review"&&x.marked||filter==="Descriptive"&&!x.objective)||[],[data,filter]);
 const a=data?.attempt;
 async function retest(){
  setBusy(true);try{const j=await getJson<{attempt:{id:string}}>("/api/tests",reqJson({kind:"MISTAKES",count:10,minutes:25}));router.push("/attempt/"+j.attempt.id)}
  catch(e){setNotice(e instanceof Error?e.message:"No mistakes available for retry")}finally{setBusy(false)}
 }
 async function saveBookmark(q:Answer){
  try{await getJson("/api/bookmarks",reqJson({questionId:q.questionId,tags:["MustRevise"],note:"From "+a?.title}));setNotice("Question added to Revision Notebook.")}
  catch(e){setNotice(e instanceof Error?e.message:"Could not save question")}
 }
 async function explain(q:Answer){
  setBusy(true);
  try{const x=await getJson<{explanation:string;ai:boolean}>("/api/ai/explain",reqJson({attemptId:id,itemId:q.id}));
   setAiText(v=>({...v,[q.id]:x.explanation+(x.ai?"":"\n\nRule-based explanation; AI key not configured.")}));}
  catch(e){setNotice(e instanceof Error?e.message:"Explanation is unavailable")}finally{setBusy(false)}
 }
 async function selfGrade(q:Answer){
  const marks=grading[q.id];if(!Number.isFinite(marks)||marks<0||marks>q.maxMarks)return setNotice("Enter a valid score first.");
  try{await getJson("/api/attempts/"+id+"/self-grade",reqJson({itemId:q.id,marks}));await load();setNotice("Your self-assessed rubric score was saved separately from verified marks.");}
  catch(e){setNotice(e instanceof Error?e.message:"Could not save score")}
 }
 async function weakDrill(code:string,unit:number){
  try{const j=await getJson<{attempt:{id:string}}>("/api/tests",reqJson({kind:"UNIT",courseCode:code,unit,count:10,minutes:30}));router.push("/attempt/"+j.attempt.id)}
  catch(e){setNotice(e instanceof Error?e.message:"No questions for this unit")}
 }
 if(!data)return <div className="panel p-7">{error||"Preparing your 15-section diagnostic report…"}</div>;
 return <div className="space-y-7">
  <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">DEEP EXAM DIAGNOSTICS</p><h1 className="page-title mt-2">{a?.title}</h1>
   <p className="muted mt-2 text-sm">15-part learning audit · Objective answers graded on the server · Personal data only</p></div>
   <div className="flex gap-2"><Link href="/tests" className="btn-secondary">All tests</Link><button onClick={retest} disabled={busy} className="btn-primary"><RefreshCcw size={16}/>Retry mistakes</button></div></header>
  <section id="overview" className="grid grid-cols-2 gap-3 xl:grid-cols-6">
   <Stat label="01 · Objective score" value={a?.score+" / "+a?.max}/><Stat label="02 · Accuracy" value={a?.accuracy.toFixed(1)+"%"}/>
   <Stat label="03 · Attempt rate" value={a?.attemptRate.toFixed(1)+"%"}/>
   <Stat label="04 · Correct responses" value={data.items.filter(q=>q.correct).length}/>
   <Stat label="05 · Positive marks" value={"+"+a?.positive}/><Stat label="06 · Penalties" value={"−"+a?.penalty}/>
  </section>
  <section className="panel p-5"><div className="flex items-start gap-3"><Lightbulb className="mt-0.5 shrink-0 text-amber-500" size={21}/><div>
   <h2 className="text-sm font-extrabold">07 · Practice performance guidance: {a?.performance}</h2>
   <p className="muted mt-2 text-xs leading-5">{data.caveat} Peer comparison and official relative grade/CGPA predictions will appear only after verified institutional grading policies and actual comparable cohort data are available.</p>
  </div></div></section>
  <div className="grid gap-5 xl:grid-cols-2">
   <section className="panel p-6"><h2 className="section-title">08 · Course-wise marks</h2><p className="muted mt-1 text-xs">Obtained versus available objective marks</p>
    <div className="mt-4 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.subjects} margin={{top:8,right:14,left:-20,bottom:30}}>
     <CartesianGrid stroke="#e7edf4" strokeDasharray="3 4"/><XAxis dataKey="code" tick={{fontSize:11}}/><YAxis tick={{fontSize:10}}/>
     <Tooltip/><Legend/><Bar dataKey="earned" name="Earned" fill="#5266e5" radius={[5,5,0,0]}/><Bar dataKey="possible" name="Maximum" fill="#b2c1f6" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div>
   </section>
   <section className="panel p-6"><h2 className="section-title">09 · Time–accuracy quadrants</h2><p className="muted mt-1 text-xs">Using per-question illustrative ideal-time targets</p>
    <div className="mt-4 grid grid-cols-2 gap-3">{data.quadrants.map(q=><div key={q.name} className={"rounded-xl p-4 "+(quadColors[q.name]||"bg-slate-50")}>
     <p className="text-xs font-bold">{q.name}</p><p className="mt-2 text-3xl font-black">{q.count}</p></div>)}</div>
   </section>
  </div>
  <section className="panel p-6"><h2 className="section-title">10 · Unit strength matrix</h2><p className="muted mt-1 text-xs">This matrix uses actual scores from this practice attempt.</p>
   <div className="mt-5 grid gap-4 lg:grid-cols-2">{data.units.map(u=><div key={u.code+"-"+u.unit}>
    <div className="flex justify-between gap-3 text-xs"><span className="font-bold">{u.code} · Unit {u.unit} <span className="muted font-normal">{u.coCode||"CO not mapped"}</span></span>
     <span>{u.earned}/{u.possible}</span></div>
    <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-700"><div className={"h-2 rounded-full "+(u.possible&&u.earned/u.possible<.5?"bg-amber-500":"bg-indigo-600")} style={{width:(u.possible?Math.min(100,Math.max(0,u.earned/u.possible*100)):0)+"%"}}/></div>
    <p className="muted mt-1 text-[11px]">{u.title}</p></div>)}</div>
  </section>
  <div className="grid gap-5 xl:grid-cols-2">
   <section className="panel p-6"><h2 className="section-title">11 · Course Outcome performance</h2>
    <p className="muted mt-2 text-xs">Seeded CO labels are learning mappings, not verified institutional CO definitions.</p>
    <div className="mt-4 space-y-3">{data.units.map(u=><div key={u.code+u.unit} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-xs dark:bg-slate-800">
     <span className="font-bold">{u.code} · {u.coCode||"CO pending"}</span><span className="muted">{u.attempted} attempted · {u.correct} correct</span></div>)}</div>
   </section>
   <section className="panel p-6"><h2 className="section-title">12 · Time and pacing audit</h2>
    <p className="muted mt-2 text-xs">Recorded seconds on each question versus its estimated working time.</p>
    <div className="mt-4 h-60"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.items.slice(0,20).map((q,i)=>({name:"Q"+(i+1),spent:q.timeSeconds,ideal:q.idealSeconds}))}>
     <CartesianGrid stroke="#e7edf4" strokeDasharray="3 4"/><XAxis dataKey="name" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/><Tooltip/>
     <Legend/><Bar dataKey="spent" name="Your time (s)" fill="#5266e5"/><Bar dataKey="ideal" name="Illustrative ideal (s)" fill="#efb76c"/></BarChart></ResponsiveContainer></div>
   </section>
  </div>
  <section className="grid gap-4 lg:grid-cols-3">
   <div className="panel p-5"><h2 className="section-title">13 · Weakest units</h2><div className="mt-4 space-y-3">{data.weak.map(w=><div key={w.code+"-"+w.unit} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
    <div className="flex justify-between text-xs"><span className="font-bold">{w.code} · Unit {w.unit}</span><span className="text-amber-600">{w.lost} unearned</span></div>
    <p className="muted mt-1 text-[11px]">{w.title}</p>
    <button className="mt-2 flex items-center gap-1 text-xs font-bold text-indigo-600" onClick={()=>weakDrill(w.code,w.unit||1)}>Generate 10-question drill <ArrowRight size={13}/></button>
   </div>)}</div></div>
   <div className="panel p-5"><h2 className="section-title">14 · Error and question review</h2>
    <div className="mt-4 grid grid-cols-2 gap-3">{[{label:"Wrong answers",value:data.mistakeCount},{label:"Unattempted",value:data.items.filter(q=>!q.attempted).length},
     {label:"Review flags",value:data.items.filter(q=>q.marked).length},{label:"Answer edits",value:data.items.reduce((s,q)=>s+q.answerChanges,0)}].map(m=><div key={m.label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
      <p className="muted text-[11px]">{m.label}</p><p className="mt-1 text-xl font-black">{m.value}</p></div>)}</div></div>
   <div className="panel p-5"><h2 className="section-title">15 · Action plan</h2>
    <p className="muted mt-2 text-xs leading-5">Rework slow incorrect problems, review missed concepts, then retest within 48 hours. Student-reported descriptive scores stay separate from machine-verified scores.</p>
    <div className="mt-4 flex flex-col gap-2"><button className="btn-primary" onClick={retest} disabled={busy}>Re-attempt incorrect answers</button>
     <Link className="btn-secondary" href="/notebook">Open Mistake Notebook</Link><Link href="/flashcards" className="btn-secondary">5-minute recall review</Link></div></div>
  </section>
  <section className="panel overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-5 dark:border-slate-800">
   <div><h2 className="section-title">Complete question-by-question solutions</h2><p className="muted mt-1 text-xs">Filter, inspect rubrics and ask why a response was wrong.</p></div>
   <select aria-label="Filter questions by result" className="field !w-auto" value={filter} onChange={e=>setFilter(e.target.value)}>{filters.map(f=><option key={f}>{f}</option>)}</select></div>
   <div className="divide-y divide-slate-100 dark:divide-slate-800">{rows.map((q,i)=><article key={q.id} className="px-6 py-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
     <div><p className="text-sm font-bold">{q.courseCode} · Unit {q.unit} · {q.topic}</p>
      <p className="muted mt-1 text-xs">Your response: {q.response||"Unanswered"} · Correct: {q.correctAnswer} · Time {q.timeSeconds}s / estimated {q.idealSeconds}s</p></div>
     <div className="flex items-center gap-2"><span className={"tag "+(q.correct?"!bg-green-50 !text-green-700":"!bg-red-50 !text-red-700")}>{q.objective?(q.correct?"Correct":"Incorrect / skipped"):"Self-assess"}</span>
      <button className="btn-secondary !px-3 !py-2" onClick={()=>setExpanded(v=>v.includes(q.id)?v.filter(x=>x!==q.id):[...v,q.id])}>{expanded.includes(q.id)?<ChevronUp size={16}/>:<ChevronDown size={16}/>}Solution</button></div>
    </div>
    {expanded.includes(q.id)&&<div className="mt-5 space-y-4 rounded-xl bg-slate-50 p-5 dark:bg-slate-800">
     <div className="text-sm font-semibold"><MathText text={q.stem}/></div>{q.code&&<CodeBlock code={q.code}/>}
     <div className="text-sm"><strong>Correct answer: </strong><MathText text={q.correctAnswer}/></div>
     <div className="text-sm"><strong>Worked solution: </strong><MathText text={q.solution}/></div>
     {q.concept&&<div className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200"><strong>Concept checkpoint: </strong><MathText text={q.concept}/></div>}
     {q.rubric&&<div className="rounded-xl border p-4 dark:border-slate-700"><p className="mb-3 text-sm font-bold">Stepwise marking checklist (illustrative)</p>
      {(q.rubric||[]).map((step,n)=><div key={n} className="flex justify-between gap-3 border-b border-slate-100 py-2 text-xs last:border-0 dark:border-slate-700"><span>{step.step}</span><strong>{step.marks} marks</strong></div>)}
      <div className="mt-4 flex flex-wrap items-center gap-2"><input aria-label="Self-awarded marks" type="number" min={0} max={q.maxMarks} step=".5" className="field !w-24" value={grading[q.id]??q.selfMarks??0} onChange={e=>setGrading(v=>({...v,[q.id]:Number(e.target.value)}))}/>
       <button className="btn-secondary" onClick={()=>selfGrade(q)}>Save self-rating</button>
       <span className="muted text-xs">Not counted as machine-verified marks</span></div></div>}
     <div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={()=>saveBookmark(q)}><BookmarkPlus size={15}/>Add to revision</button>
      <button className="btn-secondary" onClick={()=>explain(q)} disabled={busy}><BrainCircuit size={15}/>Ask why I got this wrong</button></div>
     {aiText[q.id]&&<p className="whitespace-pre-wrap rounded-xl bg-white p-4 text-sm leading-6 dark:bg-slate-900">{aiText[q.id]}</p>}
    </div>}
   </article>)}</div>
  </section>
  {notice&&<p role="status" className="rounded-lg bg-indigo-50 p-4 text-sm text-indigo-800 dark:bg-slate-800 dark:text-indigo-100">{notice}</p>}
 </div>;
}
