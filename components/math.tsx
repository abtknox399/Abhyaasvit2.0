"use client";
import React from "react";
import {InlineMath,BlockMath} from "react-katex";
import {Highlight,themes} from "prism-react-renderer";
export function MathText({text}:{text:string}){
 const parts=text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g);
 return <span className="question-math leading-8">{parts.map((s,i)=>{
  if(s.startsWith("$$")&&s.endsWith("$$"))return <span className="my-3 block overflow-x-auto" key={i}><BlockMath math={s.slice(2,-2)}/></span>;
  if(s.startsWith("$")&&s.endsWith("$"))return <InlineMath math={s.slice(1,-1)} key={i}/>;
  return <React.Fragment key={i}>{s}</React.Fragment>;
 })}</span>;
}
export function CodeBlock({code,language="python"}:{code:string;language?:string}){
 return <div className="overflow-x-auto rounded-xl bg-[#0c1728] p-4 text-sm">
  <Highlight theme={themes.vsDark} code={code} language={language as "python"|"java"|"c"|"cpp"|"javascript"}>
   {({tokens,getLineProps,getTokenProps})=><pre className="font-mono leading-6">{tokens.map((line,i)=><div key={i} {...getLineProps({line})}>
    <span className="mr-4 inline-block w-5 select-none text-right text-slate-500">{i+1}</span>
    {line.map((tok,j)=><span key={j} {...getTokenProps({token:tok})}/>)}</div>)}</pre>}
  </Highlight>
 </div>;
}
