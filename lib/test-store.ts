"use client";
import {create} from "zustand";
import type {AttemptItem,AttemptView} from "@/lib/types";
export type PaletteStatus="unvisited"|"unanswered"|"answered"|"review"|"answered-review";
export function palette(item:AttemptItem):PaletteStatus{
 if(item.bookmarkedForReview)return item.response?.trim()?"answered-review":"review";
 if(item.response?.trim())return "answered";
 return item.visited?"unanswered":"unvisited";
}
type State={attempt:AttemptView|null;index:number;seconds:number;loading:boolean;
 load:(a:AttemptView)=>void;tick:()=>void;go:(index:number)=>void;
 answer:(response:string|null)=>void;mark:(value:boolean)=>void;markVisited:()=>void;reset:()=>void};
export const useTestStore=create<State>((set,get)=>({
 attempt:null,index:0,seconds:0,loading:true,
 load:a=>set({attempt:a,index:0,seconds:Math.max(0,Math.floor((Date.parse(a.deadlineAt)-Date.now())/1000)),loading:false}),
 tick:()=>{const a=get().attempt;if(a)set({seconds:Math.max(0,Math.floor((Date.parse(a.deadlineAt)-Date.now())/1000))})},
 go:index=>set({index}),
 answer:response=>set(s=>s.attempt?{attempt:{...s.attempt,items:s.attempt.items.map((v,i)=>i===s.index?{...v,response}:v)}}:s),
 mark:value=>set(s=>s.attempt?{attempt:{...s.attempt,items:s.attempt.items.map((v,i)=>i===s.index?{...v,bookmarkedForReview:value}:v)}}:s),
 markVisited:()=>set(s=>s.attempt?{attempt:{...s.attempt,items:s.attempt.items.map((v,i)=>i===s.index?{...v,visited:true,visits:v.visits+1}:v)}}:s),
 reset:()=>set({attempt:null,index:0,seconds:0,loading:true})
}));
