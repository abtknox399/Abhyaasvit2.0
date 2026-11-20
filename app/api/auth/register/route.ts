import {NextResponse} from "next/server";
import {hash} from "bcryptjs";
import {db} from "@/lib/db";
import {issueSession,sessionCookie} from "@/lib/auth";
import {asString,jsonBody,bad,failure} from "@/lib/api";
export const runtime="nodejs";
const branches=new Set(["CSE-DS","CSE","IT","AI&DS","EnTC","Mechanical","Electrical","Other"]);
export async function POST(request:Request){
 const body=await jsonBody(request),name=asString(body?.name,80),email=asString(body?.email,254).toLowerCase();
 const password=typeof body?.password==="string"?body.password:"";
 const branch=asString(body?.branch,32),year=Number(body?.year);
 if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<8||password.length>128||
  !branches.has(branch)||!Number.isInteger(year)||year<1||year>4)return bad("Enter valid student details and a password of 8–128 characters.");
 try{
  const exists=await db.user.findUnique({where:{email},select:{id:true}});
  if(exists)return NextResponse.json({error:"This email is already registered"},{status:409});
  const user=await db.user.create({data:{name,email,passwordHash:await hash(password,12),branch,studyYear:year,
   semester:year===1?1:(year-1)*2+1,preferences:{create:{}}}});
  const response=NextResponse.json({ok:true,user:{id:user.id,name:user.name,email:user.email}},{status:201});
  response.cookies.set(sessionCookie(await issueSession(user)));return response;
 }catch(e){return failure(e)}
}
