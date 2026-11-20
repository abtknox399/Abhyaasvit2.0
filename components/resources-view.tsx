"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {ArrowRight,BookOpen,ClipboardList,Download,FileText,FlaskConical,Lightbulb,Search,Sparkles} from "lucide-react";
import {getJson,type CatalogCourse} from "@/lib/types";
import {MathText} from "@/components/math";
type Resource={id:string;kind:string;title:string;content:string;verified:boolean;priority:number;sourceUrl:string|null;
 course:{code:string;title:string};unit:{number:number;title:string}|null};
const kinds=[{value:"",label:"All resources",icon:BookOpen},{value:"FORMULA",label:"Formula Sheets",icon:Lightbulb},
 {value:"NOTES",label:"Short Notes",icon:FileText},{value:"LAB_VIVA",label:"Lab Viva",icon:FlaskConical},
 {value:"HIGH_WEIGHTAGE",label:"High-Priority Summaries",icon:Sparkles}];
export function ResourcesView(){
 const [courses,setCourses]=useState<CatalogCourse[]>([]),[course,setCourse]=useState("ES26101"),[kind,setKind]=useState(""),
 [resources,setResources]=useState<Resource[]>([]),[expanded,setExpanded]=useState<string[]>([]),[error,setError]=useState("");
 useEffect(()=>{getJson<{courses:CatalogCourse[]}>("/api/catalog").then(j=>setCourses(j.courses)).catch(e=>setError(e.message))},[]);
 useEffect(()=>{
  const p=new URLSearchParams();if(course)p.set("course",course);if(kind)p.set("kind",kind);
  getJson<{resources:Resource[]}>("/api/resources?"+p).then(j=>setResources(j.resources)).catch(e=>setError(e.message));
 },[course,kind]);
 return <div className="space-y-7"><header><p className="eyebrow">EXAM-TARGETED CONTENT</p><h1 className="page-title mt-2">Quick Resource Kit</h1>
  <p className="muted mt-2 text-sm">Important concepts, unit summaries, formula sheets and lab viva prompts, arranged by course.</p></header>
  <div className="panel p-5"><label className="text-xs font-bold">Select course<select className="field mt-2 max-w-lg" value={course} onChange={e=>setCourse(e.target.value)}>
   {courses.map(c=><option key={c.id} value={c.code}>{c.code} · {c.title}</option>)}</select></label>
   <div className="mt-5 flex gap-2 overflow-x-auto pb-1">{kinds.map(({value,label,icon:Icon})=><button key={value} onClick={()=>setKind(value)}
    className={"flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold "+(kind===value?"border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950":"border-slate-200 text-slate-500 dark:border-slate-700")}>
    <Icon size={16}/>{label}</button>)}</div></div>
  <div className="grid gap-4 lg:grid-cols-2">{resources.map(r=><article key={r.id} className="panel overflow-hidden">
   <div className="flex items-start justify-between gap-3 p-5"><div><div className="flex flex-wrap gap-2"><span className="tag">{r.kind.replaceAll("_"," ")}</span>
    <span className="tag">{r.unit?"Unit "+r.unit.number:"All units"}</span></div>
    <h2 className="mt-3 font-extrabold">{r.title}</h2><p className="muted mt-1 text-xs">{r.course.title}</p></div><span className={"tag "+(r.verified?"!bg-emerald-50 !text-emerald-700":"!bg-amber-50 !text-amber-700")}>{r.verified?"Verified":"Study draft"}</span></div>
   <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800"><div className={"text-sm leading-7 "+(expanded.includes(r.id)?"":"line-clamp-4")}><MathText text={r.content}/></div>
    <div className="mt-4 flex items-center gap-3"><button className="text-xs font-extrabold text-indigo-600"
     onClick={()=>setExpanded(v=>v.includes(r.id)?v.filter(x=>x!==r.id):[...v,r.id])}>{expanded.includes(r.id)?"Show less":"Read full resource"} <ArrowRight className="inline" size={13}/></button>
     {r.sourceUrl&&<a href={r.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-500 underline">Original source</a>}</div></div>
  </article>)}</div>
  {!resources.length&&<div className="panel p-10 text-center"><BookOpen size={30} className="mx-auto text-indigo-500"/><h2 className="mt-4 text-lg font-extrabold">No resources for this filter yet</h2>
   <p className="muted mt-2 text-sm">Return to all resource types or prepare new drafts in Syllabus Studio.</p>
   <Link href="/studio" className="btn-primary mt-5">Open Studio</Link></div>}
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
 </div>;
}
