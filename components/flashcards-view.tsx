"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {ArrowLeft,ArrowRight,CheckCircle2,Clock3,Plus,RotateCcw,Save,Sparkles} from "lucide-react";
import {MathText} from "@/components/math";
import {getJson,reqJson} from "@/lib/types";
type Card={id:string;front:string;back:string;dueAt:string;intervalDays:number;reviews:number};
export function FlashcardsView(){
 const [cards,setCards]=useState<Card[]>([]),[index,setIndex]=useState(0),[flipped,setFlipped]=useState(false),[dueOnly,setDueOnly]=useState(true);
 const [front,setFront]=useState(""),[back,setBack]=useState(""),[message,setMessage]=useState("");
 const load=()=>getJson<{cards:Card[]}>("/api/flashcards").then(x=>setCards(x.cards)).catch(e=>setMessage(e.message));
 useEffect(()=>{load()},[]);
 const available=useMemo(()=>cards.filter(c=>!dueOnly||new Date(c.dueAt)<=new Date()),[cards,dueOnly]);
 const card=available[Math.min(index,Math.max(0,available.length-1))];
 async function rate(quality:number){
  if(!card)return;
  try{await getJson("/api/flashcards",reqJson({id:card.id,quality},"PATCH"));setFlipped(false);setIndex(0);await load();
   setMessage("Review saved. Next card scheduled based on recall quality.");
  }catch(e){setMessage(e instanceof Error?e.message:"Review failed")}
 }
 async function create(){
  if(!front.trim()||!back.trim())return setMessage("Both sides are required");
  try{await getJson("/api/flashcards",reqJson({front,back}));setFront("");setBack("");await load();setMessage("Flashcard created.");}
  catch(e){setMessage(e instanceof Error?e.message:"Card could not be created")}
 }
 return <div className="space-y-7"><header><p className="eyebrow">ACTIVE RECALL STUDIO</p><h1 className="page-title mt-2">Five-Minute Flashcards</h1>
  <p className="muted mt-2 text-sm">Cards from your bookmarks plus your own questions. Rate recall to schedule the next review.</p></header>
  <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3">
   <span className="tag">{cards.length} total cards</span><span className="tag">{cards.filter(c=>new Date(c.dueAt)<=new Date()).length} due now</span></div>
   <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={dueOnly} onChange={e=>{setDueOnly(e.target.checked);setIndex(0);setFlipped(false)}}/>Due cards only</label></div>
  <div className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
   <div className="panel min-h-[410px] p-6"><div className="flex justify-between"><span className="eyebrow">CARD {available.length?index+1:0} OF {available.length}</span><Clock3 className="text-indigo-500" size={20}/></div>
    {card?<div>
     <button className="mt-5 flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 p-7 text-center dark:border-indigo-900 dark:bg-indigo-950" onClick={()=>setFlipped(v=>!v)} aria-label="Flip flashcard">
      <p className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-indigo-500">{flipped?"ANSWER":"QUESTION · TAP TO REVEAL"}</p>
      <div className="text-lg font-bold leading-8 text-slate-900 dark:text-white"><MathText text={flipped?card.back:card.front}/></div>
     </button>
     {flipped?<div className="mt-5 flex flex-wrap gap-3"><button onClick={()=>rate(1)} className="btn-secondary !border-red-200 !text-red-700">Didn't know</button>
      <button onClick={()=>rate(3)} className="btn-secondary !border-amber-200 !text-amber-700">Hard</button>
      <button onClick={()=>rate(5)} className="btn-primary">Knew it <CheckCircle2 size={16}/></button></div>:
      <p className="muted mt-5 text-center text-xs">Try recalling the answer before flipping the card.</p>}
     <div className="mt-5 flex justify-between"><button className="btn-secondary" disabled={index===0} onClick={()=>{setIndex(x=>x-1);setFlipped(false)}}><ArrowLeft size={15}/>Previous</button>
      <button className="btn-secondary" disabled={index>=available.length-1} onClick={()=>{setIndex(x=>x+1);setFlipped(false)}}>Next <ArrowRight size={15}/></button></div>
    </div>:<div className="grid min-h-[320px] place-items-center text-center"><div><Sparkles className="mx-auto text-indigo-500" size={34}/>
     <h2 className="mt-4 font-extrabold">You're caught up!</h2><p className="muted mt-2 text-sm">No due flashcards. Add a card or show all cards to practice more.</p>
     <Link href="/notebook" className="btn-secondary mt-4">Open Revision Notebook</Link></div></div>}
   </div>
   <div className="panel p-6"><h2 className="section-title">Create a custom flashcard</h2><p className="muted mt-2 text-xs">Use short, recallable prompts.</p>
    <label className="mt-5 block text-xs font-bold">Front<textarea className="field mt-2" rows={4} value={front} onChange={e=>setFront(e.target.value)} placeholder="What does the rank-nullity theorem state?"/></label>
    <label className="mt-4 block text-xs font-bold">Back<textarea className="field mt-2" rows={5} value={back} onChange={e=>setBack(e.target.value)} placeholder="Write the answer or LaTeX formula here…"/></label>
    <button onClick={create} className="btn-primary mt-4"><Plus size={16}/>Create card</button></div>
  </div>
  {message&&<p role="status" className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-700">{message}</p>}
 </div>;
}
