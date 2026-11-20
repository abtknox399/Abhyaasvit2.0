"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {ArrowRight,Bookmark,CalendarDays,Check,Filter,NotebookPen,RefreshCcw,Trash2,Tag} from "lucide-react";
import {getJson,reqJson} from "@/lib/types";
import {MathText,CodeBlock} from "@/components/math";
type Bookmark={id:string;questionId:string;tags:string[];note:string;dueAt:string;intervalDays:number;ease:number;question:{
 stem:string;code:string|null;courseCode:string;courseTitle:string;unit:number;unitTitle:string;source:string}};
export function NotebookView(){
 const router=useRouter(),[rows,setRows]=useState<Bookmark[]>([]),[filter,setFilter]=useState("ALL"),[loading,setLoading]=useState(true),[message,setMessage]=useState("");
 const [notes,setNotes]=useState<{[id:string]:string}>({});
 const load=()=>getJson<{bookmarks:Bookmark[]}>("/api/bookmarks").then(x=>{setRows(x.bookmarks);setNotes(Object.fromEntries(x.bookmarks.map(b=>[b.id,b.note])))})
   .catch(e=>setMessage(e.message)).finally(()=>setLoading(false));
 useEffect(()=>{load()},[]);
 const tags=[...new Set(rows.flatMap(r=>r.tags))];
 const visible=rows.filter(b=>filter==="ALL"||b.tags.includes(filter));
 async function action(id:string,quality:number){
  try{await getJson("/api/bookmarks",reqJson({id,quality},"PATCH"));await load();setMessage("Review schedule updated.");}catch(e){setMessage(e instanceof Error?e.message:"Review failed")}
 }
 async function save(b:Bookmark){
  try{await getJson("/api/bookmarks",reqJson({questionId:b.questionId,tags:b.tags,note:notes[b.id]}));setMessage("Note updated.");await load()}
  catch(e){setMessage(e instanceof Error?e.message:"Save failed")}
 }
 async function remove(id:string){
  try{await getJson("/api/bookmarks",reqJson({id},"DELETE"));setRows(v=>v.filter(b=>b.id!==id))}
  catch(e){setMessage(e instanceof Error?e.message:"Remove failed")}
 }
 async function retry(){
  try{const j=await getJson<{attempt:{id:string}}>("/api/tests",reqJson({kind:"MISTAKES",count:10,minutes:25}));router.push("/attempt/"+j.attempt.id)}
  catch(e){setMessage(e instanceof Error?e.message:"No missed questions yet")}
 }
 return <div className="space-y-7"><header className="flex flex-wrap justify-between gap-4"><div><p className="eyebrow">YOUR PRIVATE ERROR LOG</p><h1 className="page-title mt-2">Mistake & Revision Notebook</h1>
   <p className="muted mt-2 text-sm">Saved concepts, personal notes and spaced-repetition reminders.</p></div>
   <button className="btn-primary" onClick={retry}><RefreshCcw size={16}/> Re-attempt mistakes</button></header>
  <div className="panel flex flex-wrap items-center justify-between gap-3 p-5"><div className="flex items-center gap-3">
    <span className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><Bookmark size={20}/></span><div><p className="text-xl font-black">{rows.length}</p><p className="muted text-xs">Saved questions · {rows.filter(r=>new Date(r.dueAt)<=new Date()).length} due to review</p></div></div>
    <label className="flex items-center gap-2 text-xs font-semibold"><Filter size={15}/> Category<select className="field !w-auto" value={filter} onChange={e=>setFilter(e.target.value)}>
     <option value="ALL">All bookmarks</option>{tags.map(t=><option value={t} key={t}>#{t}</option>)}</select></label></div>
  <div className="grid gap-4 xl:grid-cols-2">{visible.map(b=><article key={b.id} className="panel p-6">
   <div className="flex items-center justify-between gap-3"><span className="tag">{b.question.courseCode} · Unit {b.question.unit}</span>
    <button aria-label="Delete bookmark" title="Delete" onClick={()=>remove(b.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={17}/></button></div>
   <div className="mt-4 text-sm font-semibold"><MathText text={b.question.stem}/></div>
   {b.question.code&&<div className="mt-3"><CodeBlock code={b.question.code}/></div>}
   <div className="mt-4 flex flex-wrap gap-2">{b.tags.map(t=><span key={t} className="tag !bg-indigo-50 !text-indigo-700">#{t}</span>)}</div>
   <textarea aria-label="Personal revision note" className="field mt-4" rows={2} value={notes[b.id]??b.note}
     onChange={e=>setNotes(v=>({...v,[b.id]:e.target.value}))} placeholder="What should future-you remember?"/>
   <div className="mt-3 flex items-center justify-between gap-2"><span className="muted flex items-center gap-1 text-xs"><CalendarDays size={14}/>Due {new Date(b.dueAt).toLocaleDateString("en-IN")}</span>
    <button onClick={()=>save(b)} className="btn-secondary !px-3 !py-2"><Check size={14}/>Save note</button></div>
   <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800"><p className="mb-2 text-xs font-bold">How well do you recall it?</p>
    <div className="flex flex-wrap gap-2"><button onClick={()=>action(b.id,1)} className="btn-secondary !border-rose-200 !text-rose-600 !px-3 !py-2">Again</button>
     <button onClick={()=>action(b.id,3)} className="btn-secondary !border-amber-200 !text-amber-600 !px-3 !py-2">Hard</button>
     <button onClick={()=>action(b.id,5)} className="btn-secondary !border-green-200 !text-green-600 !px-3 !py-2">Easy</button>
     <Link href={"/vault?course="+encodeURIComponent(b.question.courseCode)} className="ml-auto inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600">Practice chapter <ArrowRight size={13}/></Link></div>
   </div></article>)}</div>
  {!loading&&!rows.length&&<div className="panel p-12 text-center"><NotebookPen size={36} className="mx-auto text-indigo-500"/><h2 className="mt-4 text-lg font-extrabold">Your notebook starts with one meaningful mistake</h2>
   <p className="muted mt-2 text-sm">Save questions from the Vault or test reports and write down why they were difficult.</p>
   <Link href="/vault" className="btn-primary mt-5">Open Question Vault <ArrowRight size={16}/></Link></div>}
  {message&&<p role="status" className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-700">{message}</p>}
 </div>;
}
