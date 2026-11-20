"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {AlertCircle,ArrowLeft,ArrowRight,BookOpen,Calculator,Check,ChevronRight,Clock3,Flag,RotateCcw,Send,Timer,X} from "lucide-react";
import {getJson,reqJson,type AttemptView,formatTimer} from "@/lib/types";
import {MathText,CodeBlock} from "@/components/math";
import {palette,useTestStore} from "@/lib/test-store";
import {evaluateArithmetic} from "@/lib/calculator";
const legend=[{id:"unvisited",label:"Not visited",className:"palette-unvisited"},
 {id:"unanswered",label:"Not answered",className:"palette-unanswered"},
 {id:"answered",label:"Answered",className:"palette-answered"},
 {id:"review",label:"Marked for review",className:"palette-review"},
 {id:"answered-review",label:"Answered and marked",className:"palette-review"}];
export function CBTRunner({id}:{id:string}){
 const router=useRouter();
 const {attempt,index,seconds,loading,load,tick,go,answer,mark,markVisited,reset}=useTestStore();
 const [error,setError]=useState(""),[busy,setBusy]=useState(false),[confirm,setConfirm]=useState(false);
 const [calculator,setCalculator]=useState(false),[expression,setExpression]=useState(""),[answerValue,setAnswerValue]=useState(""),[paper,setPaper]=useState(false);
 const [finished,setFinished]=useState(false);
 const first=useRef(false),submitRef=useRef<()=>Promise<void>>(async()=>{});
 useEffect(()=>{reset();let mounted=true;
  getJson<{attempt:AttemptView}>("/api/attempts/"+id).then(j=>{
   if(!mounted)return;
   if(j.attempt.status==="SUBMITTED"){router.replace("/analytics/"+id);return;}
   load(j.attempt);first.current=false;
  }).catch(e=>setError(e.message));
  return()=>{mounted=false};
 },[id,load,reset,router]);
 useEffect(()=>{const t=setInterval(tick,1000);return()=>clearInterval(t)},[tick]);
 const item=attempt?.items[index],q=item?.question;
 useEffect(()=>{if(!attempt||first.current||!attempt.items.length)return;first.current=true;markVisited();
  getJson("/api/attempts/"+id,reqJson({itemId:attempt.items[0].id,action:"visit"},"PATCH")).catch(()=>setError("Visit timestamp did not sync."));
 },[attempt?.id,id,markVisited]);
 async function persist(override?:{response?:string|null;marked?:boolean}){
  if(!item||busy)return false;
  setBusy(true);setError("");
  try{
   await getJson("/api/attempts/"+id,reqJson({itemId:item.id,action:"save",
    response:override?.response!==undefined?override.response:item.response,
    marked:override?.marked!==undefined?override.marked:item.bookmarkedForReview},"PATCH"));
   return true;
  }catch(e){setError(e instanceof Error?e.message:"Could not save response");return false}
  finally{setBusy(false)}
 }
 async function move(target:number,markOverride?:boolean){
  if(!attempt||target<0||target>=attempt.items.length||busy)return;
  if(seconds>0&&!(await persist(markOverride===undefined?undefined:{marked:markOverride})))return;
  go(target);markVisited();
  try{await getJson("/api/attempts/"+id,reqJson({itemId:attempt.items[target].id,action:"visit"},"PATCH"))}
  catch{setError("This question could not synchronize. Reopen the test to refresh.")}
 }
 async function submit(){
  if(!attempt||finished||busy)return;
  setFinished(true);setError("");
  if(seconds>0){const saved=await persist();if(!saved){setFinished(false);return}}
  try{await getJson("/api/attempts/"+id+"/submit",{method:"POST"});router.replace("/analytics/"+id);}
  catch(e){setFinished(false);setError(e instanceof Error?e.message:"Could not submit")}
 }
 submitRef.current=submit;
 useEffect(()=>{if(attempt&&seconds===0&&!finished)submitRef.current()},[attempt?.id,seconds,finished]);
 async function markNext(){if(!attempt)return;mark(true);if(index<attempt.items.length-1)await move(index+1,true);else await persist({marked:true})}
 const subjects=attempt?[...new Set(attempt.items.map(x=>x.question.courseCode))]:[];
 const answered=attempt?.items.filter(x=>x.response?.trim()).length||0;
 function solveCalculator(){try{setAnswerValue(String(evaluateArithmetic(expression)))}catch(e){setAnswerValue(e instanceof Error?e.message:"Invalid expression")}}
 if(loading)return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-slate-600">Preparing your secure CBT session…</main>;
 if(!attempt)return <main className="grid min-h-screen place-items-center bg-slate-50"><div className="panel p-8 text-red-600">{error||"Attempt not found"} <Link className="block pt-4 text-indigo-600" href="/tests">Return to tests</Link></div></main>;
 return <div className="min-h-screen bg-[#f3f6fa] text-slate-900">
  <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
   <div className="mx-auto flex max-w-[1700px] flex-wrap items-center justify-between gap-3 px-5 py-3">
    <div className="flex items-center gap-3"><Link href="/tests" className="text-slate-500" title="Return to tests"><ArrowLeft size={19}/></Link>
     <div><h1 className="text-base font-black">{attempt.title}</h1><p className="text-[11px] text-slate-500">Independent practice simulation · Your answer data is private</p></div></div>
    <div className="flex flex-wrap items-center gap-2"><span className={"inline-flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-sm font-extrabold "+(seconds<300?"bg-red-50 text-red-700":"bg-indigo-50 text-indigo-700")}>
     <Clock3 size={17}/>{formatTimer(seconds)}</span>
     <button className="btn-secondary !px-3 !py-2" onClick={()=>setCalculator(v=>!v)}><Calculator size={16}/> <span className="hidden sm:inline">Calculator</span></button>
     <button className="btn-primary !px-4 !py-2" onClick={()=>setConfirm(true)}><Send size={16}/> Submit Exam</button></div>
   </div>
   <div className="mx-auto flex max-w-[1700px] items-center gap-2 overflow-x-auto border-t border-slate-100 px-5">
    {subjects.map(s=><button key={s} className={"border-b-[3px] px-4 py-2.5 text-sm font-bold "+(q?.courseCode===s?"border-indigo-600 text-indigo-600":"border-transparent text-slate-500")}
     onClick={()=>{const n=attempt.items.findIndex(x=>x.question.courseCode===s);if(n>=0)move(n)}}>{s}</button>)}
    <button className="ml-auto flex shrink-0 items-center gap-1 text-xs font-bold text-slate-600" onClick={()=>setPaper(v=>!v)}><BookOpen size={15}/>{paper?"Question view":"Question paper view"}</button>
   </div>
  </header>
  <main className="mx-auto grid max-w-[1700px] gap-5 p-4 lg:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)] lg:p-6">
   <section className="panel !rounded-xl p-5 sm:p-8">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
     <div><span className="eyebrow">QUESTION {index+1} / {attempt.items.length}</span><p className="mt-1 text-xs text-slate-500">{q?.courseCode} · Unit {q?.unitNumber}: {q?.unitTitle}</p></div>
     <span className="tag">{q?.type.replaceAll("_"," ")} · {q?.maxMarks} marks</span>
    </div>
    {paper?<div className="space-y-5">{attempt.items.map((x,i)=><div key={x.id} className="rounded-xl border border-slate-200 p-4">
      <p className="mb-2 text-xs font-bold text-indigo-600">Q{i+1} · {x.question.courseCode}</p><MathText text={x.question.stem}/></div>)}</div>:
    <div className="min-h-[360px]">
     <div className="text-lg font-semibold leading-8"><MathText text={q?.stem||""}/></div>
     {q?.diagramUrl&&<p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Diagram reference: {q.diagramUrl}</p>}
     {q?.code&&<div className="my-5"><CodeBlock code={q.code}/></div>}
     {q?.type==="MCQ"&&<div className="mt-6 space-y-3">{(q.options||[]).map(o=><label key={o.id} className={"flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition "+(item?.response===o.id?"border-indigo-400 bg-indigo-50":"border-slate-200 hover:border-indigo-300")}>
      <input type="radio" name="option" checked={item?.response===o.id} onChange={()=>answer(o.id)} className="accent-indigo-600"/>
      <strong className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-xs">{o.id}</strong><MathText text={o.text}/></label>)}</div>}
     {q?.type==="NUMERICAL"&&<label className="mt-7 block max-w-md text-xs font-bold text-slate-600">Numerical answer<input className="field mt-2" inputMode="decimal" value={item?.response||""} onChange={e=>answer(e.target.value)} placeholder="Enter a number"/></label>}
     {q?.type==="CODE_OUTPUT"&&<label className="mt-7 block text-xs font-bold text-slate-600">Program output<textarea rows={3} className="field mt-2" value={item?.response||""} onChange={e=>answer(e.target.value)} placeholder="Type the exact output…"/></label>}
     {q?.type==="SUBJECTIVE"&&<label className="mt-7 block text-xs font-bold text-slate-600">Written solution / derivation (self-assessment follows submission)
      <textarea rows={9} className="field mt-2" value={item?.response||""} onChange={e=>answer(e.target.value)} placeholder="Show your important steps, assumptions and final answer…"/></label>}
    </div>}
    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
     <button disabled={busy} onClick={()=>{answer(null);persist({response:null})}} className="btn-secondary"><RotateCcw size={16}/>Clear Response</button>
     <button disabled={busy} onClick={markNext} className="btn-secondary !border-violet-200 !text-violet-700"><Flag size={16}/>Mark for Review & Next</button>
     <button disabled={busy} onClick={()=>index<attempt.items.length-1?move(index+1):persist()} className="btn-primary">Save & Next <ArrowRight size={16}/></button>
    </div>
   </section>
   <aside className="space-y-4">
    <div className="panel !rounded-xl p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-extrabold">Question palette</p><p className="muted mt-1 text-xs">{answered} of {attempt.items.length} answered</p></div><Flag className="text-indigo-500" size={20}/></div>
     <div className="mt-5 grid grid-cols-5 gap-2">{attempt.items.map((x,i)=>{
      const s=palette(x);return <button key={x.id} title={s.replace("-"," ")} aria-label={"Question "+(i+1)+": "+s} disabled={busy} onClick={()=>move(i)}
       className={"relative grid h-10 w-full place-items-center rounded-lg border text-xs font-extrabold "+(legend.find(v=>v.id===s)?.className||"palette-unvisited")+
        (index===i?" outline outline-2 outline-offset-2 outline-indigo-500":"")}>{i+1}
       {s==="answered-review"&&<span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-600 ring-2 ring-white"/>}</button>;
     })}</div>
     <div className="mt-6 grid grid-cols-1 gap-2 border-t pt-4">{legend.map(v=><div key={v.id} className="flex items-center gap-2 text-[11px] text-slate-600">
      <span className={"inline-block h-4 w-4 rounded border "+v.className}/>{v.label}</div>)}</div>
    </div>
    {calculator&&<div className="panel !rounded-xl p-5"><div className="mb-3 flex justify-between"><h3 className="text-sm font-extrabold">Arithmetic calculator</h3><button onClick={()=>setCalculator(false)}><X size={16}/></button></div>
     <input aria-label="Arithmetic expression" className="field" value={expression} onChange={e=>setExpression(e.target.value)} placeholder="(24+16)/8"/>
     <button onClick={solveCalculator} className="btn-primary mt-3 !py-2">Calculate</button><p className="mt-3 break-all font-mono text-sm">{answerValue||"Enter an expression"}</p></div>}
    <div className="rounded-xl border border-blue-100 bg-indigo-50 px-5 py-4 text-xs leading-5 text-indigo-800">
     <strong>Exam mode:</strong> Answers are saved to your account. Review is available after submission; refresh does not reset the server deadline.</div>
   </aside>
  </main>
  {error&&<div role="alert" className="fixed bottom-5 left-1/2 z-50 w-[min(90%,560px)] -translate-x-1/2 rounded-xl bg-red-600 p-4 text-sm text-white shadow-xl">{error}</div>}
  {confirm&&<div role="dialog" aria-modal="true" aria-label="Confirm test submission" className="fixed inset-0 z-50 grid place-items-center bg-slate-900/70 px-5"><div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
   <h3 className="text-xl font-black">Submit this test?</h3><p className="muted mt-2 text-sm">You have answered {answered} of {attempt.items.length} questions. Submitting ends the attempt and unlocks the detailed report.</p>
   <div className="mt-6 flex gap-3"><button onClick={()=>setConfirm(false)} className="btn-secondary">Keep working</button><button disabled={finished||busy} onClick={submit} className="btn-primary">Confirm submit <ChevronRight size={16}/></button></div>
  </div></div>}
 </div>;
}
