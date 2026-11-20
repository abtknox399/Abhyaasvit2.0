"use client";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {GraduationCap,ArrowRight} from "lucide-react";
export default function Register(){
 const router=useRouter(),[name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState("");
 const [branch,setBranch]=useState("CSE-DS"),[year,setYear]=useState("1"),[error,setError]=useState(""),[loading,setLoading]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setLoading(true);setError("");
  try{const r=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({name,email,password,branch,year:Number(year)})});const j=await r.json();
   if(!r.ok)throw Error(j.error||"Registration failed");router.push("/dashboard");router.refresh();
  }catch(e){setError(e instanceof Error?e.message:"Registration failed")}finally{setLoading(false)}
 }
 return <main className="flex min-h-screen items-center justify-center bg-[#f5f7fc] px-4 py-12"><div className="w-full max-w-lg">
  <Link href="/" className="mb-7 flex items-center justify-center gap-2 text-xl font-black"><GraduationCap className="text-indigo-600"/> ABHYAAS VIT</Link>
  <div className="rounded-3xl border bg-white p-7 shadow-soft"><h1 className="text-2xl font-black">Create your learning workspace</h1>
   <p className="mb-6 mt-2 text-sm text-slate-500">Fresh account, personal exam progress and private revision notebook.</p>
   <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
    <label className="block text-sm font-bold sm:col-span-2">Full name<input className="field mt-1" required value={name} onChange={e=>setName(e.target.value)}/></label>
    <label className="block text-sm font-bold sm:col-span-2">Email<input className="field mt-1" required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
    <label className="block text-sm font-bold sm:col-span-2">Password (8+ characters)<input className="field mt-1" required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
    <label className="block text-sm font-bold">Year<select className="field mt-1" value={year} onChange={e=>setYear(e.target.value)}><option value="1">First year</option><option value="2">Second year</option><option value="3">Third year</option><option value="4">Fourth year</option></select></label>
    <label className="block text-sm font-bold">Branch<select className="field mt-1" value={branch} onChange={e=>setBranch(e.target.value)}>{["CSE-DS","CSE","IT","AI&DS","EnTC","Mechanical","Electrical","Other"].map(x=><option key={x}>{x}</option>)}</select></label>
    {error&&<p role="alert" className="sm:col-span-2 text-sm text-red-600">{error}</p>}
    <button disabled={loading} className="btn-primary sm:col-span-2">{loading?"Creating…":"Create account"} <ArrowRight size={16}/></button>
   </form><p className="mt-5 text-center text-sm text-slate-500">Already registered? <Link href="/login" className="font-bold text-indigo-600">Sign in</Link></p>
  </div>
 </div></main>;
}
