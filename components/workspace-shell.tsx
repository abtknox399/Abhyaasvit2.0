"use client";
import {useEffect,useMemo,useState,type ReactNode} from "react";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {BookOpen,BrainCircuit,CalendarClock,ChevronLeft,ChevronRight,ClipboardList,FileClock,
 GraduationCap,LayoutDashboard,Lightbulb,LogOut,Menu,Microscope,Moon,Search,Sun,Timer,TrendingUp,NotebookPen} from "lucide-react";
import {getJson,reqJson} from "@/lib/types";
type User={name:string;email:string;studyYear:number;semester:number;branch:string;academicYear:string};
type Event={title:string;startsAt:string|null;officialVerified:boolean};
const routes=[
 {href:"/dashboard",label:"Overview",icon:LayoutDashboard,group:"WORKSPACE"},
 {href:"/timeline",label:"Exam Timeline & Centers",icon:CalendarClock,group:"ACADEMICS"},
 {href:"/tests",label:"Mock Tests & CBT",icon:ClipboardList,group:"ACADEMICS"},
 {href:"/vault",label:"PYQ & Practice Vault",icon:BookOpen,group:"ACADEMICS"},
 {href:"/notebook",label:"Mistake Notebook",icon:NotebookPen,group:"IMPROVE"},
 {href:"/flashcards",label:"Flashcard Review",icon:FileClock,group:"IMPROVE"},
 {href:"/studio",label:"AI Syllabus Studio",icon:BrainCircuit,group:"TOOLS"},
 {href:"/resources",label:"Resource Kit",icon:Lightbulb,group:"TOOLS"},
 {href:"/sandbox",label:"Code & Math Sandbox",icon:Microscope,group:"TOOLS"}
];
export function WorkspaceShell({children,initialUser}:{children:ReactNode;initialUser:User}){
 const path=usePathname(),router=useRouter();
 const [collapsed,setCollapsed]=useState(false),[mobile,setMobile]=useState(false),[dark,setDark]=useState(false);
 const [user,setUser]=useState(initialUser),[search,setSearch]=useState(""),[event,setEvent]=useState<Event|null>(null),[now,setNow]=useState(Date.now());
 useEffect(()=>{const stored=localStorage.getItem("abhyaas-theme");const isDark=stored==="dark";setDark(isDark);document.documentElement.classList.toggle("dark",isDark)},[]);
 useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[]);
 useEffect(()=>{getJson<{events:Event[]}>("/api/events?year="+encodeURIComponent(user.academicYear)+"&semester="+user.semester)
  .then(j=>setEvent(j.events.filter(e=>e.officialVerified&&e.startsAt&&new Date(e.startsAt).getTime()>Date.now())[0]||null)).catch(()=>setEvent(null));
 },[user.academicYear,user.semester]);
 const countdown=useMemo(()=>{
  if(!event?.startsAt)return null;
  const diff=Math.max(0,Date.parse(event.startsAt)-now),days=Math.floor(diff/86400000),hours=Math.floor(diff%86400000/3600000),minutes=Math.floor(diff%3600000/60000);
  return days+"d "+hours+"h "+minutes+"m";
 },[event,now]);
 async function saveUser(patch:Partial<User>){
  const next={...user,...patch};setUser(next);
  try{await getJson("/api/me",reqJson({studyYear:next.studyYear,semester:next.semester,branch:next.branch,academicYear:next.academicYear},"PATCH"));router.refresh();}
  catch{setUser(user);}
 }
 function toggleTheme(){const v=!dark;setDark(v);document.documentElement.classList.toggle("dark",v);localStorage.setItem("abhyaas-theme",v?"dark":"light")}
 async function logout(){await fetch("/api/auth/logout",{method:"POST"});router.push("/");router.refresh()}
 const groups=["WORKSPACE","ACADEMICS","IMPROVE","TOOLS"];
 return <div className="min-h-screen bg-[#f6f8fc] text-slate-900 transition-colors dark:bg-[#0b1424] dark:text-white">
  {mobile&&<button aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" onClick={()=>setMobile(false)}/>}
  <aside className={"fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-[#122037] "+(collapsed?"w-[76px]":"w-[258px]")+" "+(mobile?"translate-x-0":"-translate-x-full lg:translate-x-0")}>
   <Link href="/dashboard" className="flex h-[78px] items-center gap-3 border-b border-slate-100 px-5 dark:border-slate-800">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white"><GraduationCap size={23}/></span>
    {!collapsed&&<span className="whitespace-nowrap text-lg font-black tracking-tight">ABHYAAS <span className="text-indigo-600">VIT</span><small className="mt-1 block text-[10px] font-bold tracking-[.19em] text-slate-400">ACADEMIC COMMAND CENTER</small></span>}
   </Link>
   <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-5">{groups.map(group=><div key={group} className="mb-5">
    {!collapsed&&<div className="mb-2 px-3 text-[10px] font-extrabold tracking-[.17em] text-slate-400">{group}</div>}
    {routes.filter(r=>r.group===group).map(({href,label,icon:Icon})=>{
     const active=path===href||path.startsWith(href+"/");
     return <Link href={href} onClick={()=>setMobile(false)} title={collapsed?label:undefined} key={href}
      className={"mb-1 flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition "+(active?"bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200":"text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800")}>
      <Icon size={19} className="shrink-0"/>{!collapsed&&<span className="truncate">{label}</span>}</Link>
    })}</div>)}</nav>
   <div className="border-t border-slate-100 p-3 dark:border-slate-800"><button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-2 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300" onClick={()=>setCollapsed(v=>!v)}>
    {collapsed?<ChevronRight size={16}/>:<ChevronLeft size={16}/>} {!collapsed&&"Collapse sidebar"}</button></div>
  </aside>
  <div className={"transition-[margin] "+(collapsed?"lg:ml-[76px]":"lg:ml-[258px]")}>
   <header className="sticky top-0 z-30 flex min-h-[78px] flex-wrap items-center gap-3 border-b border-slate-200 bg-white/95 px-5 py-3 backdrop-blur dark:border-slate-800 dark:bg-[#122037]/95 xl:gap-5">
    <button aria-label="Open navigation" className="lg:hidden" onClick={()=>setMobile(true)}><Menu size={23}/></button>
    <div className="relative hidden min-w-[170px] flex-1 max-w-sm md:block"><Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400"/>
     <input aria-label="Search app sections" placeholder="Search features…" className="field !pl-9" value={search} onChange={e=>setSearch(e.target.value)}/>
     {search.trim()&&<div className="absolute left-0 right-0 top-12 z-40 rounded-xl border bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      {routes.filter(x=>x.label.toLowerCase().includes(search.toLowerCase())).slice(0,5).map(x=><Link key={x.href} href={x.href} onClick={()=>setSearch("")} className="block rounded-lg px-3 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-slate-800">{x.label}</Link>)}
      {!routes.some(x=>x.label.toLowerCase().includes(search.toLowerCase()))&&<span className="block px-3 py-2 text-xs muted">No matching section</span>}</div>}</div>
    <div className="flex flex-wrap items-center gap-2">
     <select aria-label="Academic year of study" className="field !w-auto !py-2 !text-xs" value={user.studyYear} onChange={e=>saveUser({studyYear:Number(e.target.value),semester:Number(e.target.value)===1?1:(Number(e.target.value)-1)*2+1})}>
      {[1,2,3,4].map(y=><option key={y} value={y}>{["","FY","SY","TY","B.Tech"][y]}</option>)}</select>
     <select aria-label="Branch" className="field !w-auto !py-2 !text-xs" value={user.branch} onChange={e=>saveUser({branch:e.target.value})}>
      {["CSE-DS","CSE","IT","AI&DS","EnTC","Mechanical","Electrical","Other"].map(v=><option key={v}>{v}</option>)}</select>
     <select aria-label="Semester" className="field !w-auto !py-2 !text-xs" value={user.semester} onChange={e=>saveUser({semester:Number(e.target.value)})}>
      {Array.from({length:8},(_,i)=><option key={i+1} value={i+1}>Sem {i+1}</option>)}</select>
    </div>
    <Link href="/timeline" className="hidden items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 xl:inline-flex">
     <Timer size={15}/>{countdown?countdown:"Exam dates unverified"}</Link>
    <div className="ml-auto flex items-center gap-2">
     <button aria-label={dark?"Enable light mode":"Enable dark mode"} onClick={toggleTheme} className="rounded-xl border p-2.5 text-slate-500 dark:border-slate-700 dark:text-slate-200">{dark?<Sun size={17}/>:<Moon size={17}/>}</button>
     <div className="hidden h-9 w-9 place-items-center rounded-full bg-indigo-100 text-sm font-extrabold text-indigo-700 sm:grid">{user.name.slice(0,1).toUpperCase()}</div>
     <button aria-label="Sign out" title="Sign out" onClick={logout} className="rounded-xl border p-2.5 text-slate-500 dark:border-slate-700 dark:text-slate-300"><LogOut size={17}/></button>
    </div>
   </header>
   <div className="mx-auto max-w-[1540px] px-4 py-7 sm:px-7 lg:px-9">{children}</div>
  </div>
 </div>;
}
