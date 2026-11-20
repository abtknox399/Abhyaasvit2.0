import assert from "node:assert/strict";
const base=process.env.SMOKE_BASE_URL||"http://127.0.0.1:3000";
async function request(path,{method="GET",data,cookie,form}={}){
 const headers={};
 if(cookie)headers.Cookie=cookie;
 if(data)headers["Content-Type"]="application/json";
 const res=await fetch(base+path,{method,headers,body:form||((data===undefined)?undefined:JSON.stringify(data)),redirect:"manual"});
 const json=await res.json().catch(()=>null);
 return {status:res.status,body:json,headers:res.headers};
}
async function main(){
 const unauth=await request("/api/dashboard");
 assert.equal(unauth.status,401,"Unauthorized dashboard must return 401");
 const login=await request("/api/auth/login",{method:"POST",data:{email:"demo@abhyaasvit.test",password:process.env.DEMO_PASSWORD||"Demo@2026Abhyaas"}});
 assert.equal(login.status,200,JSON.stringify(login.body));
 const cookie=login.headers.get("set-cookie")?.split(";")[0];
 assert.ok(cookie?.startsWith("abhyaas_v2_session="),"HTTP-only session cookie missing");
 const catalog=await request("/api/catalog",{cookie});
 assert.equal(catalog.status,200);
 assert.ok(catalog.body.courses.find(x=>x.code==="ES26101"),"Missing FY Linear Algebra");
 assert.ok(catalog.body.courses.find(x=>x.code==="DEMO-SY-DS101"),"Missing labelled SY demonstration");
 const tests=await request("/api/tests",{cookie});
 assert.equal(tests.status,200);
 const template=tests.body.tests.find(t=>t.id==="demo-boe-unit2");
 assert.ok(template,"Circuit practice test template missing");
 const created=await request("/api/tests",{method:"POST",cookie,data:{kind:"UNIT",templateId:template.id,count:2,minutes:15}});
 assert.equal(created.status,201,JSON.stringify(created.body));
 const id=created.body.attempt.id;
 const launched=await request("/api/attempts/"+id,{cookie});
 assert.equal(launched.status,200);
 assert.equal(launched.body.attempt.items.length,2);
 assert.ok(!JSON.stringify(launched.body).includes("correctAnswer"),"Answer key leaked before submission");
 assert.ok(!JSON.stringify(launched.body).includes("solution"),"Solution leaked before submission");
 const first=launched.body.attempt.items[0];
 const leak=await request("/api/practice",{method:"POST",cookie,data:{questionId:first.question.id,response:"8"}});
 assert.equal(leak.status,409,"Instant practice must not expose answer keys for live mock questions");
 const visited=await request("/api/attempts/"+id,{method:"PATCH",cookie,data:{itemId:first.id,action:"visit"}});
 assert.equal(visited.status,200);
 const saved=await request("/api/attempts/"+id,{method:"PATCH",cookie,data:{itemId:first.id,action:"save",response:"8",marked:false}});
 assert.equal(saved.status,200);
 const submit=await request("/api/attempts/"+id+"/submit",{method:"POST",cookie});
 assert.equal(submit.status,200);
 const report=await request("/api/attempts/"+id+"/report",{cookie});
 assert.equal(report.status,200);
 assert.ok(report.body.attempt.score===4,"Expected a correct 4-mark numerical response");
 assert.equal(report.body.items.length,2);
 const dashboard=await request("/api/dashboard",{cookie});
 assert.equal(dashboard.status,200);
 assert.ok(dashboard.body.subjects.find(x=>x.code==="ES26105")?.solved>=1,
  "Submitted CBT answers should contribute to course progress and daily practice");
 const late=await request("/api/attempts/"+id,{method:"PATCH",cookie,data:{itemId:first.id,action:"save",response:"6",marked:false}});
 assert.equal(late.status,409,"Submitted attempts must be immutable");
 const bookmark=await request("/api/bookmarks",{method:"POST",cookie,data:{questionId:report.body.items[0].questionId,tags:["Formula"],note:"Remember resistors in series"}});
 assert.equal(bookmark.status,200);
 const notebook=await request("/api/bookmarks",{cookie});assert.equal(notebook.status,200);
 assert.ok(notebook.body.bookmarks.some(x=>x.questionId===report.body.items[0].questionId),"Personal bookmark not saved");
 const flashcards=await request("/api/flashcards",{cookie});assert.equal(flashcards.status,200);
 assert.ok(flashcards.body.cards.length>=1,"A bookmarked concept should create a flashcard");
 const verified=await request("/api/events",{method:"POST",cookie,data:{examType:"MSE",title:"Unauthorized exam date",academicYear:"2026-27",semester:1,officialVerified:true,
  startsAt:"2027-02-01T10:00:00+05:30",sourceUrl:"https://www.vit.edu"}});
 assert.equal(verified.status,403,"Students must not publish verified timetables");
 const form=new FormData();form.set("title","Smoke test syllabus");form.set("rawText","ES26101 - Linear Algebra\nUnit 1: Row reduction and matrix rank\nUnit 2: Vector spaces and bases");
 const draft=await request("/api/studio",{method:"POST",form,cookie});
 assert.equal(draft.status,201,JSON.stringify(draft.body));
 assert.equal(draft.body.item.status,"DRAFT","Generated content must stay unpublished");
 console.log("HTTP smoke passed: auth, catalog, CBT, private answers, scoring, bookmark, flashcard, timetable authorization, syllabus ingestion.");
}
main().catch(e=>{console.error(e);process.exitCode=1});
