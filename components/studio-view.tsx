"use client";
import {useEffect,useState} from "react";
import {BrainCircuit,BookOpenCheck,Check,ChevronDown,ChevronUp,FileInput,FileText,FileUp,Lightbulb,Lock,Search,Sparkles,UploadCloud,UserRoundCheck} from "lucide-react";
import {getJson,reqJson} from "@/lib/types";
type Import={id:string;title:string;sourceType:string;status:string;aiAssisted:boolean;createdAt:string;parsed:unknown;generated:unknown};
type Result={item:{id:string;title:string;status:string;parsed:unknown;generated:unknown;aiAssisted:boolean};warning:string};
type Account={role:string};
export function StudioView(){
 const [tab,setTab]=useState<"paste"|"pdf">("paste"),[title,setTitle]=useState("FY Linear Algebra · Unit Topics"),[raw,setRaw]=useState(""),
 [file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<Result|null>(null);
 const [recent,setRecent]=useState<Import[]>([]),[expanded,setExpanded]=useState<string[]>([]),[role,setRole]=useState("STUDENT");
 const refresh=()=>getJson<{imports:Import[]}>("/api/studio").then(j=>setRecent(j.imports)).catch(e=>setError(e.message));
 useEffect(()=>{refresh();getJson<{user:Account}>("/api/me").then(j=>setRole(j.user.role)).catch(()=>{})},[]);
 async function ingest(){
  setBusy(true);setError("");setResult(null);
  try{const data=new FormData();data.set("title",title);if(tab==="pdf"&&file)data.set("file",file);else data.set("rawText",raw);
   const response=await fetch("/api/studio",{method:"POST",body:data});const j=await response.json();
   if(!response.ok)throw Error(j.error||"Document could not be processed");
   setResult(j);await refresh();
  }catch(e){setError(e instanceof Error?e.message:"Extraction failed")}finally{setBusy(false)}
 }
 async function action(id:string,act:"review"|"publish"|"reject"){
  try{await getJson("/api/studio/"+id,reqJson({action:act},"PATCH"));await refresh();}
  catch(e){setError(e instanceof Error?e.message:"Could not change review state")}
 }
 const current=result?.item;
 return <div className="space-y-7">
  <header><p className="eyebrow">AI-NATIVE CONTENT WORKSPACE</p><h1 className="page-title mt-2">Syllabus & PYQ Studio</h1>
   <p className="muted mt-2 text-sm">Turn syllabus text or searchable PDFs into reviewable unit structures, draft questions, formula outlines and short notes. Human verification comes before publication.</p></header>
  <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
   <section className="panel p-6"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="section-title">Start a source import</h2><span className="tag">{role==="ADMIN"?"Administrator workspace":"Student draft workspace"}</span></div>
    <div className="mt-5 flex gap-2 rounded-xl bg-slate-50 p-1 dark:bg-slate-800">
     <button onClick={()=>setTab("paste")} className={"flex-1 rounded-lg px-4 py-3 text-xs font-bold "+(tab==="paste"?"bg-white text-indigo-700 shadow-sm dark:bg-indigo-900 dark:text-white":"muted")}><FileInput className="mr-2 inline" size={16}/>Paste syllabus text</button>
     <button onClick={()=>setTab("pdf")} className={"flex-1 rounded-lg px-4 py-3 text-xs font-bold "+(tab==="pdf"?"bg-white text-indigo-700 shadow-sm dark:bg-indigo-900 dark:text-white":"muted")}><FileUp className="mr-2 inline" size={16}/>Upload PDF</button></div>
    <label className="mt-5 block text-xs font-bold">Document title<input className="field mt-2" value={title} onChange={e=>setTitle(e.target.value)}/></label>
    {tab==="paste"?<label className="mt-4 block text-xs font-bold">Paste raw academic source text<textarea className="field mt-2" rows={12}
      value={raw} onChange={e=>setRaw(e.target.value)} placeholder={"ES26101 - Linear Algebra\nUnit 1: Systems of Linear Equations\nRank, echelon form, Gauss elimination\nUnit 2: Vector Spaces\nBasis, span, subspaces"}/></label>:
     <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 px-5 py-12 text-center dark:bg-indigo-950">
      <UploadCloud size={31} className="text-indigo-600"/><span className="mt-3 text-sm font-bold">{file?.name||"Choose a searchable syllabus or PYQ PDF"}</span>
      <span className="muted mt-1 text-xs">PDF only · 8MB maximum · image-only scans need OCR</span>
      <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>}
    <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
     Original past papers must be verified before marking them as official PYQs. Generated materials are unpublished drafts, not reliable student content by default.</div>
    <button onClick={ingest} disabled={busy||(tab==="paste"?raw.trim().length<25:!file)} className="btn-primary mt-5">
     <BrainCircuit size={17}/>{busy?"Extracting and generating…":"Analyze document & create drafts"}</button>
   </section>
   <section className="space-y-5">
    <div className="panel p-6"><div className="flex items-center gap-2"><Sparkles size={20} className="text-indigo-600"/><h2 className="section-title">What the Studio creates</h2></div>
     <div className="mt-5 space-y-4">{[
      {icon:BookOpenCheck,title:"Structured syllabus",desc:"Subjects → units → subtopics in editable draft form"},
      {icon:FileText,title:"Practice question drafts",desc:"Original MCQs, numericals and worked response outlines"},
      {icon:Lightbulb,title:"Notes and formula ideas",desc:"Unit-level quick revision and formula-card candidates"},
      {icon:UserRoundCheck,title:"Human review gate",desc:"Only administrator-reviewed content may move toward publication"}
     ].map(({icon:Icon,title,desc})=><div key={title} className="flex gap-3"><span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><Icon size={20}/></span>
      <div><h3 className="text-sm font-extrabold">{title}</h3><p className="muted mt-1 text-xs leading-5">{desc}</p></div></div>)}</div>
    </div>
    <div className="panel p-6"><h2 className="section-title">Review safeguards</h2><p className="muted mt-3 text-xs leading-6">
     LLM generation is enabled only when a server-side provider key is configured. Without one, the Studio still performs deterministic unit extraction and outline drafting, clearly labelled as such.</p>
     <p className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-600"><Lock size={15}/>Private original documents are not publicly hosted.</p></div>
   </section>
  </div>
  {current&&<section className="panel p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">NEW SOURCE IMPORT</p><h2 className="section-title mt-2">{current.title}</h2></div>
    <span className="tag">{current.aiAssisted?"LLM-assisted draft":"Deterministic outline draft"}</span></div>
    <p className="muted mt-3 text-xs">{result?.warning}</p>
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
     <div className="rounded-xl border p-4 dark:border-slate-700"><h3 className="text-sm font-extrabold">Extracted syllabus tree</h3>
      <pre className="scrollbar-thin mt-3 max-h-[450px] overflow-auto whitespace-pre-wrap break-words text-xs leading-6">{JSON.stringify(current.parsed,null,2)}</pre></div>
     <div className="rounded-xl border p-4 dark:border-slate-700"><h3 className="text-sm font-extrabold">Question, note & formula drafts</h3>
      <pre className="scrollbar-thin mt-3 max-h-[450px] overflow-auto whitespace-pre-wrap break-words text-xs leading-6">{JSON.stringify(current.generated,null,2)}</pre></div>
    </div>
    <div className="mt-5 flex flex-wrap gap-3"><button className="btn-secondary" onClick={()=>action(current.id,"review")}><Check size={16}/>Mark reviewed</button>
     {role==="ADMIN"&&<button className="btn-primary" onClick={()=>action(current.id,"publish")}>Approve staging draft</button>}</div>
   </section>}
  <section className="panel p-6"><h2 className="section-title">Import history</h2><div className="mt-4 divide-y dark:divide-slate-800">
   {recent.map(item=><div key={item.id} className="py-4"><div className="flex flex-wrap items-center justify-between gap-3">
     <div><p className="text-sm font-extrabold">{item.title}</p><p className="muted mt-1 text-xs">{item.sourceType} · {new Date(item.createdAt).toLocaleDateString("en-IN")} · {item.aiAssisted?"AI-assisted":"Parser-only"}</p></div>
     <div className="flex items-center gap-2"><span className="tag">{item.status}</span><button onClick={()=>setExpanded(v=>v.includes(item.id)?v.filter(x=>x!==item.id):[...v,item.id])}>
      {expanded.includes(item.id)?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button></div></div>
    {expanded.includes(item.id)&&<div className="mt-3 grid gap-3 lg:grid-cols-2"><pre className="max-h-64 overflow-auto rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800">{JSON.stringify(item.parsed,null,2)}</pre>
     <pre className="max-h-64 overflow-auto rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800">{JSON.stringify(item.generated,null,2)}</pre></div>}</div>)}
   {!recent.length&&<p className="muted py-8 text-center text-sm">No source imports yet. Your first document will appear here.</p>}</div></section>
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
 </div>;
}
