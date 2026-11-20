import "dotenv/config";
import assert from "node:assert/strict";
import {PrismaClient} from "@prisma/client";
const db=new PrismaClient();
const base=process.env.SMOKE_BASE_URL||"http://127.0.0.1:3000";
const signIn=await fetch(base+"/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},
 body:JSON.stringify({email:"demo@abhyaasvit.test",password:process.env.DEMO_PASSWORD||"Demo@2026Abhyaas"})});
assert.equal(signIn.status,200);
const cookie=signIn.headers.get("set-cookie")?.split(";")[0];assert.ok(cookie);
const request=async(path,body,method="PATCH")=>{
 const response=await fetch(base+path,{method,headers:{"Content-Type":"application/json",Cookie:cookie},body:JSON.stringify(body)});
 return {status:response.status,body:await response.json()};
};
try{
 const form=new FormData();form.set("title","Admin publishing test");form.set("rawText",
  "ES26101 - Linear Algebra\nUnit 1: Row echelon form\nGaussian elimination and matrix rank\nUnit 2: Vector Spaces\nBasis, span, and subspaces");
 const created=await fetch(base+"/api/studio",{method:"POST",headers:{Cookie:cookie},body:form});
 assert.equal(created.status,201);
 const data=await created.json(),id=data.item.id;
 const q={unit:1,type:"MCQ",stem:"Choose the method that finds row echelon form through elementary operations.",
  options:[{id:"A",text:"Gaussian elimination"},{id:"B",text:"Numerical quadrature"},{id:"C",text:"Heap sort"},{id:"D",text:"Tree traversal"}],
  correctAnswer:"A",solution:"Gaussian elimination applies elementary row operations to produce echelon form.",
  concept:"Rank equals the number of nonzero rows of a row echelon form.",topic:"Row echelon form",
  maxMarks:4,idealSeconds:100};
 const forbidden=await request("/api/studio/"+id,{action:"publish",courseCode:"ES26101",questions:[q]});
 assert.equal(forbidden.status,403,"Students must not publish practice content");
 const review=await request("/api/studio/"+id,{action:"review"});
 assert.equal(review.status,200);
 const user=await db.user.findUniqueOrThrow({where:{email:"demo@abhyaasvit.test"}});
 await db.user.update({where:{id:user.id},data:{role:"ADMIN"}});
 const synced=await request("/api/studio/"+id,{action:"sync-catalog",courseCode:"ES26101"});
 assert.equal(synced.status,200,JSON.stringify(synced.body));
 const published=await request("/api/studio/"+id,{action:"publish",courseCode:"ES26101",questions:[q]});
 assert.equal(published.status,200,JSON.stringify(published.body));
 assert.equal(published.body.status,"PUBLISHED");
 const list=await fetch(base+"/api/practice?course=ES26101&source=AI_DRAFT",{headers:{Cookie:cookie}});
 assert.equal(list.status,200);
 const rows=(await list.json()).questions;
 assert.ok(rows.some(x=>x.stem===q.stem),"Reviewed practice not published to user bank");
 const stored=await db.question.findFirstOrThrow({where:{id:"approved-"+id+"-0"}});
 assert.equal(stored.verified,false);
 assert.equal(stored.source,"AI_DRAFT");
 const after=await request("/api/studio/"+id,{action:"publish",courseCode:"ES26101",questions:[q]});
 assert.equal(after.status,400,"Already-published content should not be republished");
 console.log("STUDIO PASS: source import, student authorization, review gate, syllabus sync, validated question publication, non-PYQ provenance");
}finally{
 await db.$disconnect();
}
