import {cookies} from "next/headers";
import {SignJWT,jwtVerify} from "jose";
import {redirect} from "next/navigation";
import {db} from "@/lib/db";
import type {UserRole} from "@prisma/client";
const COOKIE="abhyaas_v2_session";
function key(){
 const secret=process.env.AUTH_SECRET;
 if(!secret||secret.length<32){
  if(process.env.NODE_ENV==="production")throw new Error("Production AUTH_SECRET missing or too short");
  return new TextEncoder().encode("abhyaas-local-development-only-key-change-in-production");
 }
 return new TextEncoder().encode(secret);
}
export async function issueSession(user:{id:string;email:string;role:UserRole}){
 return new SignJWT({email:user.email,role:user.role}).setProtectedHeader({alg:"HS256"})
 .setSubject(user.id).setIssuedAt().setExpirationTime("10d").sign(key());
}
export async function sessionUser(){
 const raw=(await cookies()).get(COOKIE)?.value;
 if(!raw)return null;
 try{
  const {payload}=await jwtVerify(raw,key(),{algorithms:["HS256"]});
  if(!payload.sub)return null;
  return db.user.findUnique({where:{id:payload.sub},select:{
   id:true,email:true,name:true,role:true,academicYear:true,studyYear:true,semester:true,branch:true
  }});
 }catch{return null}
}
export async function requireUser(){
 const user=await sessionUser();if(!user)redirect("/login");return user;
}
export async function requireAdmin(){
 const user=await requireUser();if(user.role!=="ADMIN")redirect("/dashboard");return user;
}
export function sessionCookie(value:string){return {name:COOKIE,value,httpOnly:true,
 secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/",maxAge:864000};}
