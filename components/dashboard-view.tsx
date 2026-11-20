"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {ArrowRight,BookOpen,BrainCircuit,CalendarClock,CheckCircle2,Clock3,Flame,GraduationCap,Play,Trophy,Target,TrendingUp} from "lucide-react";
import {getJson,reqJson,type CatalogCourse} from "@/lib/types";
type Overview={user:{name:string;branch:string;studyYear:number};goal:number;xp:number;streak:number;solvedToday:number;completed:number;bookmarks:number;
 accuracy:number|null;subjects:{id:string;code:string;title:string;solved:number;questionCount:number;accuracy:number|null}[];
 recent:{id:string;title:string;kind:string;status:string;score:number|null;possibleMarks:number|null}[];
 upcoming:{id:string;title:string;examType:string;startsAt:string|null;campus:string|null;room:string|null}[]};
export function DashboardView(){
 const [data,setData]=useState<Overview|null>(null),[catalog,setCatalog]=useState<CatalogCourse[]>([]);
 const [goal,setGoal]=useState(20),[message,setMessage]=useState(""),[module,setModule]=useState("MODULE_1");
 useEffect(()=>{Promise.all([getJson<Overview>("/api/dashboard"),getJson<{courses:CatalogCourse[]}>("/api/catalog")])
  .then(([a,b])=>{setData(a);setGoal(a.goal);setCatalog(b.courses)}).catch(e=>setMessage(e.message))},[]);
 const pct=data?Math.min(100,Math.round(data.solvedToday/Math.max(data.goal,1)*100)):0;
 const filtered=useMemo(()=>catalog.filter(c=>c.year===1?c.module===module||c.module==="COMMON":c.branch==="CSE-DS"),[catalog,module]);
 async function saveGoal(){try{await getJson("/api/dashboard",reqJson({dailyGoal:goal},"PATCH"));
  setData(v=>v?{...v,goal}:v);setMessage("Daily target updated.");}catch(e){setMessage(e instanceof Error?e.message:"Unable to save goal");}}
 const upcoming=data?.upcoming?.[0];
 return <div className="space-y-7">
  <section className="flex flex-wrap items-end justify-between gap-4">
   <div><p className="eyebrow">YOUR ACADEMIC COMMAND CENTER</p><h1 className="page-title mt-2">
    {data?"Welcome back, "+data.user.name.split(" ")[0]:"Your next study session"}</h1>
    <p className="muted mt-2 text-sm">Pick a course, practice a concept, and turn each mistake into progress.</p></div>
   <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
    {["MODULE_1","MODULE_2"].map(m=><button key={m} onClick={()=>setModule(m)}
     className={"rounded-lg px-4 py-2 text-xs font-extrabold "+(module===m?"bg-white text-indigo-700 shadow-sm dark:bg-indigo-600 dark:text-white":"text-slate-500 dark:text-slate-300")}>
     {m==="MODULE_1"?"Module 1":"Module 2"}</button>)}</div>
  </section>
  {message&&<p role="status" className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:bg-slate-800 dark:text-indigo-200">{message}</p>}
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
   <div className="panel flex items-center gap-4 p-5">
    <div className="relative h-24 w-24 shrink-0"><svg viewBox="0 0 100 100" role="img" aria-label={"Daily goal "+pct+"%"}>
      <circle cx="50" cy="50" r="41" stroke="#e5ecf9" strokeWidth="9" fill="none"/>
      <circle cx="50" cy="50" r="41" stroke="#4f63ea" strokeWidth="9" fill="none" strokeLinecap="round" transform="rotate(-90 50 50)"
       strokeDasharray={2*Math.PI*41} strokeDashoffset={(1-pct/100)*2*Math.PI*41}/>
      <text x="50" y="55" textAnchor="middle" fontSize="21" fill="currentColor" fontWeight="800">{pct}%</text></svg></div>
    <div><p className="muted text-xs">Daily questions</p><p className="mt-1 text-2xl font-black">{data?.solvedToday??0}<span className="text-base text-slate-400">/{data?.goal??20}</span></p>
     <div className="mt-2 flex gap-1"><input aria-label="Question target" type="number" min={1} max={500} className="field !w-16 !px-2 !py-1" value={goal} onChange={e=>setGoal(Number(e.target.value))}/>
      <button onClick={saveGoal} className="rounded-lg bg-indigo-600 px-2 text-xs font-bold text-white">Set</button></div></div>
   </div>
   {[
    {icon:Flame,label:"Daily streak",value:(data?.streak??0)+" days",hint:"Consistent practice",color:"text-orange-500 bg-orange-50"},
    {icon:Trophy,label:"Practice XP",value:data?.xp??0,hint:"Points from questions",color:"text-indigo-600 bg-indigo-50"},
    {icon:Target,label:"Practice accuracy",value:data?.accuracy===null?"New":(data?.accuracy??0)+"%",hint:"Across checked practice",color:"text-emerald-600 bg-emerald-50"}
   ].map(({icon:Icon,label,value,hint,color})=><div key={label} className="panel p-5"><span className={"mb-3 inline-flex rounded-xl p-3 "+color}><Icon size={20}/></span>
     <p className="muted text-xs">{label}</p><p className="mt-1 text-2xl font-black">{value}</p><p className="muted mt-1 text-xs">{hint}</p></div>)}
  </div>
  <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
   <div className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800"><h2 className="section-title">Your courses</h2><Link href="/vault" className="flex items-center gap-1 text-xs font-bold text-indigo-600">Question bank <ArrowRight size={15}/></Link></div>
    <div className="grid gap-4 p-5 sm:grid-cols-2">{filtered.map(c=>{
     const s=data?.subjects.find(x=>x.code===c.code),pct=s?.questionCount?Math.round(s.solved/s.questionCount*100):0;
     return <Link key={c.code} href={"/vault?course="+encodeURIComponent(c.code)} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-soft dark:border-slate-700 dark:bg-[#17263e]">
      <div className="flex items-center justify-between gap-2"><span className="tag text-indigo-700">{c.code}</span><span className="muted text-[11px]">{c.units.length} units</span></div>
      <h3 className="mt-4 min-h-[44px] text-[15px] font-extrabold leading-5">{c.title}</h3>
      <div className="mt-5 flex justify-between text-xs"><span className="muted">Question coverage</span><span className="font-bold">{pct}%</span></div>
      <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-700"><div className="h-2 rounded-full bg-indigo-600" style={{width:pct+"%"}}/></div>
      <div className="mt-3 flex items-center justify-between text-xs"><span className="muted">Accuracy</span><span className="font-bold">{s?.accuracy===null?"Not measured":s?.accuracy===undefined?"No attempts":s.accuracy+"%"}</span></div>
      {c.units.some(u=>u.topics.some(t=>t.priority==="HIGH"))&&<p className="mt-3 text-[11px] font-bold text-amber-600">High-priority topics available</p>}
     </Link>
    })}{!filtered.length&&<div className="col-span-2 rounded-xl bg-slate-50 p-6 text-sm muted dark:bg-slate-800">Courses for this rotation are awaiting verified publication. Switch modules or view the full catalog.</div>}</div>
   </div>
   <div className="space-y-5">
    <div className="panel p-6"><div className="flex items-center gap-2"><CalendarClock className="text-indigo-600" size={20}/><h2 className="section-title">Next official exam</h2></div>
     {upcoming?.startsAt?<div className="mt-5"><p className="font-bold">{upcoming.title}</p><p className="muted mt-2 text-sm">{new Date(upcoming.startsAt).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",dateStyle:"full",timeStyle:"short"})}</p>
      <p className="muted mt-2 text-xs">Campus: {upcoming.campus||"Not announced"} · Room: {upcoming.room||"Not announced"}</p></div>:
      <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">No verified future timetable for your selection. The system will not guess exam dates.</div>}
     <Link href="/timeline" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-600">Open exam hub <ArrowRight size={15}/></Link>
    </div>
    <div className="panel p-6"><h2 className="section-title">Jump back in</h2><div className="mt-4 space-y-3">{data?.recent.map(a=><Link key={a.id} href={a.status==="SUBMITTED"?"/analytics/"+a.id:"/attempt/"+a.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-indigo-50 dark:border-slate-700 dark:hover:bg-slate-800">
      <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><Play size={15}/></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{a.title}</p><p className="muted text-[11px]">{a.status==="SUBMITTED"?"View report":"Resume attempt"}</p></div><ArrowRight size={16}/></Link>)}
      {!data?.recent.length&&<p className="muted text-sm">No previous attempts yet. Start with a quick unit test.</p>}</div>
     <Link href="/tests" className="btn-primary mt-4 w-full">Explore mock tests <ArrowRight size={15}/></Link>
    </div>
   </div>
  </div>
  <section className="grid gap-4 md:grid-cols-3">
   {[{href:"/tests",icon:Clock3,title:"Timed CBT Simulations",desc:"Official-style palette, timer and focused review."},
     {href:"/notebook",icon:BrainCircuit,title:"Mistake Notebook",desc:"Keep a personal archive of ideas to revisit."},
     {href:"/studio",icon:BookOpen,title:"AI Syllabus Studio",desc:"Structure your notes and generate reviewed learning drafts."}
   ].map(({href,icon:Icon,title,desc})=><Link key={href} href={href} className="panel flex items-start gap-3 p-5 hover:border-indigo-300"><span className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><Icon size={20}/></span>
    <div><h3 className="font-bold">{title}</h3><p className="muted mt-1 text-xs leading-5">{desc}</p></div><ArrowRight size={16} className="ml-auto shrink-0 text-slate-400"/></Link>)}
  </section>
 </div>;
}
