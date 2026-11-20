"use client";
import {useState} from "react";
import {Braces,Calculator,Check,Code2,Copy,Play,Sigma,Terminal,TriangleAlert} from "lucide-react";
import {CodeBlock,MathText} from "@/components/math";
import {evaluateArithmetic} from "@/lib/calculator";
import {getJson,reqJson} from "@/lib/types";
const examples:{[key:string]:string}={
 python:"def triangular(n):\n    return n * (n + 1) // 2\n\nprint(triangular(5))",
 c:"#include <stdio.h>\nint main(void) {\n    int x = 5;\n    printf(\"%d\\n\", x * x);\n    return 0;\n}",
 cpp:"#include <iostream>\nint main() {\n    std::cout << 2*3 << std::endl;\n    return 0;\n}",
 java:"class Main {\n    public static void main(String[] args) {\n        System.out.println(5 * 5);\n    }\n}"
};
export function SandboxView(){
 const [language,setLanguage]=useState("python"),[code,setCode]=useState(examples.python),[output,setOutput]=useState(""),
 [running,setRunning]=useState(false),[latex,setLatex]=useState("\\operatorname{rank}(A)+\\operatorname{nullity}(A)=n"),
 [arithmetic,setArithmetic]=useState("(24+16)/8"),[result,setResult]=useState(""),[notice,setNotice]=useState("");
 async function run(){
  setRunning(true);setOutput("");
  try{const r=await getJson<{stdout:string;stderr:string;exitCode:number}>("/api/code",reqJson({language,code}));
   setOutput((r.stdout||"")+(r.stderr?"\nSTDERR:\n"+r.stderr:"")+"\nExit code: "+r.exitCode);
  }catch(e){setOutput(e instanceof Error?e.message:"Execution unavailable")}finally{setRunning(false)}
 }
 function calculate(){try{setResult(String(evaluateArithmetic(arithmetic)))}catch(e){setResult(e instanceof Error?e.message:"Invalid arithmetic expression")}}
 return <div className="space-y-7"><header><p className="eyebrow">ENGINEERING SCRATCHPADS</p><h1 className="page-title mt-2">Code & Math Sandbox</h1>
  <p className="muted mt-2 text-sm">Sketch algorithms, preview code, render mathematics, and evaluate arithmetic without leaving your revision workspace.</p></header>
  <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
   <section className="panel p-6"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Code2 className="text-indigo-600"/><h2 className="section-title">Code editor</h2></div>
    <span className="tag">Syntax preview</span></div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-2"><label className="text-xs font-bold">Language<select className="field ml-2 !w-auto" value={language}
     onChange={e=>{setLanguage(e.target.value);setCode(examples[e.target.value])}}>
      <option value="python">Python</option><option value="c">C</option><option value="cpp">C++</option><option value="java">Java</option></select></label>
     <button className="btn-secondary !py-2" onClick={async()=>{await navigator.clipboard.writeText(code);setNotice("Code copied.")}}><Copy size={15}/>Copy</button></div>
    <textarea aria-label="Code source" spellCheck={false} rows={12} className="field mt-4 w-full !rounded-xl !bg-[#101c2e] !font-mono !text-slate-100"
     value={code} onChange={e=>setCode(e.target.value)}/>
    <details className="mt-4"><summary className="cursor-pointer text-xs font-extrabold text-indigo-600">Show syntax-highlighted preview</summary>
     <div className="mt-3"><CodeBlock code={code} language={language}/></div></details>
    <div className="mt-5 flex flex-wrap gap-3"><button className="btn-primary" disabled={running} onClick={run}><Play size={16}/>{running?"Running…":"Run in isolated service"}</button>
     <span className="muted self-center text-xs">Execution requires an approved external sandbox provider.</span></div>
    {output&&<pre aria-live="polite" className="scrollbar-thin mt-5 max-h-56 overflow-auto rounded-xl bg-slate-900 p-4 text-xs leading-6 text-slate-100">{output}</pre>}
    <div className="mt-5 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
     <TriangleAlert size={17} className="shrink-0"/>Student-written Python, C, C++ and Java are never executed inside the Next.js server process. Configure an isolated code runner to enable execution.</div>
   </section>
   <div className="space-y-5">
    <section className="panel p-6"><div className="flex items-center gap-2"><Sigma className="text-indigo-600"/><h2 className="section-title">Live LaTeX scratchpad</h2></div>
     <p className="muted mt-2 text-xs">Edit formulas and render instantly with KaTeX.</p>
     <textarea aria-label="LaTeX equation" className="field mt-4 !font-mono" rows={5} value={latex} onChange={e=>setLatex(e.target.value)}/>
     <div className="mt-4 min-h-28 rounded-xl border border-indigo-100 bg-indigo-50 p-5 text-center text-lg text-slate-800 dark:bg-indigo-950 dark:text-white">
      <MathText text={"$$"+latex+"$$"}/></div>
     <p className="muted mt-3 text-xs">Try matrices, eigenvalue equations, integrals or derivatives.</p></section>
    <section className="panel p-6"><div className="flex items-center gap-2"><Calculator className="text-indigo-600"/><h2 className="section-title">Safe arithmetic calculator</h2></div>
     <p className="muted mt-2 text-xs">Supports numbers, brackets, addition, subtraction, multiplication, and division. No dynamic code execution.</p>
     <input aria-label="Arithmetic expression" className="field mt-4 !font-mono" value={arithmetic} onChange={e=>setArithmetic(e.target.value)}/>
     <div className="mt-4 flex items-center gap-3"><button className="btn-primary" onClick={calculate}>Evaluate</button>
      <span className="font-mono text-lg font-bold">{result}</span></div></section>
   </div>
  </div>{notice&&<p role="status" className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-700">{notice}</p>}
 </div>;
}
