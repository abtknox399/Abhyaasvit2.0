import {cookies} from "next/headers";
import {SignJWT,jwtVerify} from "jose";
import {randomUUID} from "node:crypto";
import {redirect} from "next/navigation";
import {db} from "@/lib/db";
import type {UserRole} from "@prisma/client";
const COOKIE="abhyaas_v2_session";
const DURATION_MS=10*24*60*60*1000;
function key(){
 const secret=process.env.AUTH_SECRET;
 if(!secret||secret.length<32){
  if(process.env.NODE_ENV==="production")throw new Error("Production AUTH_SECRET missing or too short");
  return new TextEncoder().encode("abhyaas-local-development-only-key-change-in-production");
 }
 return new TextEncoder().encode(secret);
}
export async function issueSession(user:{id:string;email:string;role:UserRole}){
 const tokenId=randomUUID(),expiresAt=new Date(Date.now()+DURATION_MS);
 await db.authSession.create({data:{userId:user.id,tokenId,expiresAt}});
 try{
  return await new SignJWT({email:user.email,role:user.role}).setProtectedHeader({alg:"HS256"})
   .setJti(tokenId).setSubject(user.id).setIssuedAt()
   .setExpirationTime(Math.floor(expiresAt.getTime()/1000)).sign(key());
 }catch(error){
  await db.authSession.deleteMany({where:{tokenId}});
  throw error;
 }
}
async function sessionClaims(){
 const raw=(await cookies()).get(COOKIE)?.value;
 if(!raw)return null;
 try{
  const {payload}=await jwtVerify(raw,key(),{algorithms:["HS256"]});
  if(!payload.sub||!payload.jti)return null;
  return {userId:payload.sub,tokenId:payload.jti};
 }catch{return null}
}
export async function sessionUser(){
 const claims=await sessionClaims();if(!claims)return null;
 const record=await db.authSession.findUnique({where:{tokenId:claims.tokenId},include:{user:{
  select:{id:true,email:true,name:true,role:true,academicYear:true,studyYear:true,semester:true,branch:true}
 }}});
 if(!record||record.userId!==claims.userId||record.revokedAt||record.expiresAt<=new Date())return null;
 return record.user;
}
export async function revokeCurrentSession(){
 const claims=await sessionClaims();if(!claims)return;
 await db.authSession.updateMany({where:{tokenId:claims.tokenId,userId:claims.userId,revokedAt:null},
  data:{revokedAt:new Date()}});
}
export async function requireUser(){
 const user=await sessionUser();if(!user)redirect("/login");return user;
}
export async function requireAdmin(){
 const user=await requireUser();if(user.role!=="ADMIN")redirect("/dashboard");return user;
}
export function sessionCookie(value:string){
 return {name:COOKIE,value,httpOnly:true,secure:process.env.NODE_ENV==="production",
  sameSite:"lax" as const,path:"/",maxAge:Math.floor(DURATION_MS/1000)};
}
