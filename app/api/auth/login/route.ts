import {NextResponse} from "next/server";
import {compare} from "bcryptjs";
import {db} from "@/lib/db";
import {issueSession,sessionCookie} from "@/lib/auth";
import {asString,jsonBody,bad,failure} from "@/lib/api";
export const runtime="nodejs";
export async function POST(request:Request){
 const body=await jsonBody(request);const email=asString(body?.email,254).toLowerCase(),password=asString(body?.password,200);
 if(!email||!password)return bad("Email and password are required");
 try{
  const user=await db.user.findUnique({where:{email}});
  if(!user||!(await compare(password,user.passwordHash)))return NextResponse.json({error:"Invalid email or password"},{status:401});
  const response=NextResponse.json({ok:true,user:{id:user.id,name:user.name,email:user.email}});
  response.cookies.set(sessionCookie(await issueSession(user)));return response;
 }catch(e){return failure(e)}
}
