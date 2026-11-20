import {NextResponse} from "next/server";
import {compare} from "bcryptjs";
import {createHash} from "node:crypto";
import {db} from "@/lib/db";
import {issueSession,sessionCookie} from "@/lib/auth";
import {asString,jsonBody,bad,failure} from "@/lib/api";
export const runtime="nodejs";
const WINDOW_MS=15*60*1000,MAX_FAILURES=6;
function throttleKey(request:Request,email:string){
 // Store only an irreversibly hashed email and source-IP combination.
 const ip=(request.headers.get("x-real-ip")||request.headers.get("x-forwarded-for")?.split(",")[0]||"unknown").slice(0,90);
 return createHash("sha256").update(email+"|"+ip).digest("hex");
}
async function markFailure(key:string){
 const old=await db.authThrottle.findUnique({where:{key}});
 const now=new Date();
 if(!old||now.getTime()-old.windowStart.getTime()>WINDOW_MS){
  await db.authThrottle.upsert({where:{key},create:{key,failures:1,windowStart:now},
   update:{failures:1,windowStart:now,blockedUntil:null}});
  return;
 }
 const next=old.failures+1;
 await db.authThrottle.update({where:{key},data:{
  failures:{increment:1},...(next>=MAX_FAILURES?{blockedUntil:new Date(now.getTime()+WINDOW_MS)}:{})
 }});
}
export async function POST(request:Request){
 const body=await jsonBody(request);
 const email=asString(body?.email,254).toLowerCase(),password=asString(body?.password,200);
 if(!email||!password)return bad("Email and password are required");
 try{
  const key=throttleKey(request,email);
  const throttle=await db.authThrottle.findUnique({where:{key}});
  if(throttle?.blockedUntil&&throttle.blockedUntil>new Date()){
   return NextResponse.json({error:"Too many attempts. Try again later."},{status:429,headers:{"Retry-After":"900"}});
  }
  const user=await db.user.findUnique({where:{email}});
  if(!user||!(await compare(password,user.passwordHash))){
   await markFailure(key);
   return NextResponse.json({error:"Invalid email or password"},{status:401});
  }
  await db.authThrottle.deleteMany({where:{key}});
  const response=NextResponse.json({ok:true,user:{id:user.id,name:user.name,email:user.email}});
  response.cookies.set(sessionCookie(await issueSession(user)));
  return response;
 }catch(e){return failure(e)}
}
