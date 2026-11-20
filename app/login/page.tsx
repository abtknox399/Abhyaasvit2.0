"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {BookOpenCheck,LockKeyhole,ArrowRight} from "lucide-react";
export default function Login(){
 const router=useRouter(),[email,setEmail]=useState(""),[password,setPassword]=useState("");
 const [pending,setPending]=useState(false),[error,setError]=useState("");
 async function submit(e:FormEvent){e.preventDefault();setPending(true);setError("");
  try{const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
   const j=await r.json();if(!r.ok)throw Error(j.error||"Sign in failed");router.push("/dashboard");router.refresh();
  }catch(err){setError(err instanceof Error?err.message:"Sign in failed")}finally{setPending(false)}
 }
 return <main className="flex min-h-screen items-center justify-center bg-[#f5f7fc] px-4 py-16">
  <div className="w-full max-w-md"><Link href="/" className="mb-8 flex items-center justify-center gap-2 text-xl font-black text-slate-900"><BookOpenCheck className="text-indigo-600"/> ABHYAAS <span className="text-indigo-600">VIT</span></Link>
   <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft"><div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><LockKeyhole/></div>
    <h1 className="text-2xl font-black tracking-tight">Welcome back</h1><p className="mt-2 text-sm text-slate-500">Your courses, exam attempts, and notes are right where you left them.</p>
    <form className="mt-6 space-y-4" onSubmit={submit}><label className="block text-sm font-semibold">Email<input className="field mt-1.5" required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
     <label className="block text-sm font-semibold">Password<input className="field mt-1.5" required type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
     {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
     <button disabled={pending} className="btn-primary w-full">{pending?"Signing in…":"Enter workspace"} <ArrowRight size={16}/></button></form>
    {process.env.NODE_ENV!=="production"&&<div className="mt-5 rounded-xl bg-indigo-50 px-4 py-3 text-xs text-indigo-700"><strong>Local development:</strong> Use the demo credentials in the README after running the seed.</div>}
    <p className="mt-6 text-center text-sm text-slate-500">New here? <Link className="font-bold text-indigo-600" href="/register">Create account</Link></p>
   </div>
  </div>
 </main>;
}
