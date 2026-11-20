import Link from "next/link";
import {ArrowRight,BrainCircuit,CalendarClock,ClipboardList,GraduationCap} from "lucide-react";
export default function Home(){
 return <main className="min-h-screen bg-[#f5f7fc] text-[#17243b]">
  <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
   <div className="flex items-center gap-3 text-xl font-black tracking-tight"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white"><GraduationCap size={23}/></span>ABHYAAS <span className="text-indigo-600">VIT</span></div>
   <div className="flex items-center gap-3"><Link href="/login" className="hidden text-sm font-semibold sm:inline">Sign in</Link><Link href="/register" className="btn-primary">Get started <ArrowRight size={16}/></Link></div>
  </header>
  <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
   <div><span className="eyebrow">THE ENGINEERING EXAM PREP WORKSPACE</span>
    <h1 className="mt-5 text-5xl font-black leading-[1.09] tracking-[-.045em] md:text-6xl">One place to <span className="text-indigo-600">prepare, practice</span> and improve.</h1>
    <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">VIT-aligned question practice, exam-realistic mock tests, deep analytics and a personal revision system. Built for engineering students who have more to do than organize loose PDFs.</p>
    <div className="mt-8 flex flex-wrap gap-3"><Link href="/register" className="btn-primary">Create account <ArrowRight size={18}/></Link><Link href="/login" className="btn-secondary">Explore demo</Link></div>
    <p className="mt-5 text-xs text-slate-500">Independent academic tool. Not an official VIT Pune service.</p>
   </div>
   <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_30px_100px_rgba(30,52,84,.09)]">
    <div className="flex items-center justify-between border-b pb-4"><span className="text-sm font-bold">Academic overview</span><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">AY 2026–27</span></div>
    <div className="mt-5 grid grid-cols-2 gap-3">{[{n:"20",t:"Daily practice target",c:"bg-blue-50 text-blue-700"},{n:"5",t:"CBT palette states",c:"bg-violet-50 text-violet-700"},{n:"15",t:"Report dimensions",c:"bg-emerald-50 text-emerald-700"},{n:"24/7",t:"Revision notebook",c:"bg-orange-50 text-orange-700"}].map(x=><div key={x.t} className={"rounded-2xl p-5 "+x.c}><div className="text-3xl font-black">{x.n}</div><div className="mt-2 text-xs font-semibold">{x.t}</div></div>)}</div>
    <div className="mt-5 rounded-2xl border p-4"><div className="mb-3 flex justify-between text-sm"><span className="font-bold">Syllabus coverage</span><span className="font-semibold text-indigo-600">Personalized</span></div>{["Linear Algebra","Programming for Engineers","Engineering Fundamentals"].map((s,i)=><div key={s} className="mb-3 last:mb-0"><div className="mb-1 flex justify-between text-xs text-slate-500"><span>{s}</span><span>Unit tracker</span></div><div className="h-2 rounded bg-slate-100"><div className="h-full rounded bg-indigo-500" style={{width:[72,47,58][i]+"%"}}/></div></div>)}</div>
   </div>
  </section>
  <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-20 md:grid-cols-3">{[{icon:ClipboardList,t:"Exam-realistic CBT",d:"Five-state palette, timer, objective scoring and rubric-based self-evaluation."},{icon:BrainCircuit,t:"Smarter revision",d:"Know which concepts caused mistakes and review them through spaced repetition."},{icon:CalendarClock,t:"Verified exam planning",d:"Keep track of exam schedules, centers and deadlines without invented dates."}].map(({icon:Icon,t,d})=><div key={t} className="rounded-2xl border border-slate-200 bg-white p-6"><Icon className="text-indigo-600" size={24}/><h3 className="mt-4 font-extrabold">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{d}</p></div>)}</section>
 </main>;
}
