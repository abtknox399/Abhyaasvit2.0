"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {ArrowRight,BookmarkPlus,BookOpen,CheckCircle2,ChevronLeft,ChevronRight,Filter,Lightbulb,Play,RotateCcw,Search,SlidersHorizontal,XCircle} from "lucide-react";
import {MathText,CodeBlock} from "@/components/math";
import {getJson,reqJson,type CatalogCourse,type SafeQuestion} from "@/lib/types";
type Checked={correct:boolean;correctAnswer:string;solution:string;concept:string|null;xp:number};
const reasons=["Formula","TrickyCode","ImportantPYQ","ConceptGap","CalculationError","MustRevise"];
const sources=[{id:"",label:"All sources"},{id:"ORIGINAL_DEMO",label:"Original practice"},{id:"VERIFIED_PYQ",label:"Verified VIT PYQ"},{id:"TUTORIAL",label:"Tutorial Sheet"},{id:"LAB_VIVA",label:"Lab Viva"}];
export function VaultView({courseHint}:{courseHint?:string}){
 const [catalog,setCatalog]=useState<CatalogCourse[]>([]),[course,setCourse]=useState(courseHint||"ES26101"),[unit,setUnit]=useState(""),
 [source,setSource]=useState(""),[format,setFormat]=useState(""),[difficulty,setDifficulty]=useState(""),[topic,setTopic]=useState("");
 const [questions,setQuestions]=useState<SafeQuestion[]>([]),[index,setIndex]=useState(0),[answer,setAnswer]=useState(""),
 [checked,setChecked]=useState<Checked|null>(null),[busy,setBusy]=useState(false),[notice,setNotice]=useState(""),[tag,setTag]=useState("ConceptGap"),[note,setNote]=useState("");
 useEffect(()=>{getJson<{courses:CatalogCourse[]}>("/api/catalog").then(r=>setCatalog(r.courses)).catch(e=>setNotice(e.message))},[]);
 const selected=useMemo(()=>catalog.find(c=>c.code===course),[catalog,course]);
 const topics=selected?.units.filter(u=>!unit||u.number===Number(unit)).flatMap(u=>u.topics)||[];
 useEffect(()=>{
  let live=true;const params=new URLSearchParams();
  if(course)params.set("course",course);if(unit)params.set("unit",unit);if(source)params.set("source",source);
  if(format)params.set("format",format);if(difficulty)params.set("difficulty",difficulty);if(topic)params.set("topic",topic);
  setQuestions([]);setIndex(0);setChecked(null);setAnswer("");setNotice("");
  getJson<{questions:SafeQuestion[]}>("/api/practice?"+params).then(r=>{if(live)setQuestions(r.questions)})
  .catch(e=>{if(live)setNotice(e.message)});
  return()=>{live=false};
 },[course,unit,source,format,difficulty,topic]);
 function change(index:number){setIndex(index);setAnswer("");setChecked(null);setNotice("")}
 const q=questions[index];
 async function verify(){if(!q||!answer.trim())return setNotice("Choose an answer to check.");
  setBusy(true);setNotice("");
  try{const r=await getJson<Checked>("/api/practice",reqJson({questionId:q.id,response:answer}));setChecked(r)}
  catch(e){setNotice(e instanceof Error?e.message:"Could not check answer")}finally{setBusy(false)}
 }
 async function bookmark(){if(!q)return;try{
  await getJson("/api/bookmarks",reqJson({questionId:q.id,tags:[tag],note}));setNotice("Saved in your private Mistake Notebook, and a flashcard was queued.");
 }catch(e){setNotice(e instanceof Error?e.message:"Could not save bookmark")}}
 async function makeTest(){
  try{const j=await getJson<{attempt:{id:string}}>("/api/tests",reqJson({kind:"CUSTOM",courseCode:course,
   unit:unit?Number(unit):0,count:Math.min(10,Math.max(1,questions.length)),minutes:30}));
   window.location.href="/attempt/"+j.attempt.id;
  }catch(e){setNotice(e instanceof Error?e.message:"Cannot launch unit mock")}}
 return <div className="space-y-6">
  <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">CHAPTER-WISE PRACTICE</p><h1 className="page-title mt-2">PYQ & Tutorial Vault</h1>
   <p className="muted mt-2 text-sm">Solve syllabus-linked problems. Official PYQs appear here only after source verification.</p></div>
   <button onClick={makeTest} className="btn-primary"><Play size={16}/> Timed unit drill</button></div>
  <div className="panel p-5"><div className="flex items-center gap-2"><SlidersHorizontal className="text-indigo-600" size={19}/><h2 className="section-title">Refine your practice</h2></div>
   <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
    <label className="text-xs font-bold">Course<select className="field mt-1.5" value={course} onChange={e=>{setCourse(e.target.value);setUnit("");setTopic("")}}>
     {catalog.map(c=><option value={c.code} key={c.id}>{c.code} · {c.title}</option>)}</select></label>
    <label className="text-xs font-bold">Unit<select className="field mt-1.5" value={unit} onChange={e=>{setUnit(e.target.value);setTopic("")}}><option value="">All units</option>
     {selected?.units.map(u=><option key={u.id} value={u.number}>Unit {u.number}: {u.title}</option>)}</select></label>
    <label className="text-xs font-bold">Topic<select className="field mt-1.5" value={topic} onChange={e=>setTopic(e.target.value)}><option value="">All subtopics</option>
     {topics.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
    <label className="text-xs font-bold">Source<select className="field mt-1.5" value={source} onChange={e=>setSource(e.target.value)}>{sources.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
    <label className="text-xs font-bold">Format<select className="field mt-1.5" value={format} onChange={e=>setFormat(e.target.value)}><option value="">All formats</option><option value="MCQ">MCQ</option><option value="NUMERICAL">Numerical</option><option value="CODE_OUTPUT">Code output</option><option value="SUBJECTIVE">Descriptive theory</option></select></label>
    <label className="text-xs font-bold">Difficulty<select className="field mt-1.5" value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option value="">All difficulties</option><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select></label>
   </div><p className="muted mt-4 text-xs">{questions.length} matched question(s) · no invented PYQ labels</p></div>
  {q?<section className="panel overflow-hidden">
   <div className="flex flex-wrap justify-between gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
    <div><p className="eyebrow">QUESTION {index+1} OF {questions.length}</p><p className="muted mt-1 text-xs">{q.courseCode} · Unit {q.unitNumber}: {q.topic}</p></div>
    <span className="tag">{q.type.replaceAll("_"," ")} · {q.difficulty}</span></div>
   <div className="px-6 py-6"><div className="text-lg font-semibold leading-8"><MathText text={q.stem}/></div>
    {q.code&&<div className="mt-5"><CodeBlock code={q.code}/></div>}
    {q.type==="MCQ"&&<div className="mt-6 space-y-3">{(q.options||[]).map(o=><label key={o.id} className={"flex items-center gap-3 rounded-xl border p-4 "+(answer===o.id?"border-indigo-400 bg-indigo-50 dark:bg-indigo-950":"border-slate-200 dark:border-slate-700")}>
     <input type="radio" name="answer" checked={answer===o.id} onChange={()=>setAnswer(o.id)} disabled={Boolean(checked)} className="accent-indigo-600"/><span className="font-bold">{o.id}</span><MathText text={o.text}/></label>)}</div>}
    {q.type==="NUMERICAL"&&<input className="field mt-6 max-w-sm" inputMode="decimal" placeholder="Enter numerical answer" value={answer} onChange={e=>setAnswer(e.target.value)} disabled={Boolean(checked)}/>}
    {q.type==="CODE_OUTPUT"&&<textarea className="field mt-6" rows={3} placeholder="Exact output" value={answer} onChange={e=>setAnswer(e.target.value)} disabled={Boolean(checked)}/>}
    {q.type==="SUBJECTIVE"&&<div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-indigo-900">
     Descriptive problems use the timed Theory Simulator for rubric-based self-evaluation. Detailed solutions are revealed after submitting that mock.
     <Link href="/tests" className="ml-2 font-bold underline">Open tests</Link></div>}
    <div className="mt-6 flex flex-wrap items-center gap-3">
     {q.type!=="SUBJECTIVE"&&<button disabled={busy||Boolean(checked)} className="btn-primary" onClick={verify}><CheckCircle2 size={16}/>Check answer</button>}
     <select aria-label="Bookmark reason" className="field !w-auto" value={tag} onChange={e=>setTag(e.target.value)}>{reasons.map(t=><option key={t} value={t}>#{t}</option>)}</select>
     <button className="btn-secondary" onClick={bookmark}><BookmarkPlus size={16}/>Add to revision</button>
    </div>
    <textarea aria-label="Personal bookmark note" className="field mt-4" rows={2} placeholder="Optional personal note about this question…" value={note} onChange={e=>setNote(e.target.value)}/>
    {checked&&<div className={"mt-6 rounded-xl border p-5 "+(checked.correct?"border-green-200 bg-green-50 text-green-900":"border-amber-200 bg-amber-50 text-amber-900")}>
     <h3 className="flex items-center gap-2 font-extrabold">{checked.correct?<CheckCircle2 size={18}/>:<XCircle size={18}/>}
      {checked.correct?"Correct · +"+checked.xp+" XP":"Needs revision · +"+checked.xp+" XP"}</h3>
     <div className="mt-4 text-sm"><strong>Correct answer: </strong><MathText text={checked.correctAnswer}/></div>
     <div className="mt-3 text-sm"><strong>Step-by-step solution: </strong><MathText text={checked.solution}/></div>
     {checked.concept&&<div className="mt-4 rounded-lg bg-white/70 p-4 text-sm"><Lightbulb size={15} className="mr-1 inline"/><strong> Quick concept: </strong><MathText text={checked.concept}/></div>}
    </div>}
    <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
     <button className="btn-secondary" disabled={index===0} onClick={()=>change(index-1)}><ChevronLeft size={16}/>Previous</button>
     <button className="btn-primary" disabled={index===questions.length-1} onClick={()=>change(index+1)}>Next question <ChevronRight size={16}/></button></div>
   </div></section>:<div className="panel p-12 text-center"><BookOpen size={32} className="mx-auto text-indigo-500"/>
    <h2 className="mt-4 text-lg font-extrabold">No questions match these filters</h2>
    <p className="muted mt-2 text-sm">If you selected verified PYQs, none have been imported and approved yet. Switch to Original practice for demo content.</p></div>}
  {notice&&<div role="status" className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">{notice}</div>}
 </div>;
}
