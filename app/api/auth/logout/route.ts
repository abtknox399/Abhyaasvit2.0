import {NextResponse} from "next/server";
import {sessionCookie,revokeCurrentSession} from "@/lib/auth";
import {failure} from "@/lib/api";
export async function POST(){
 try{
  await revokeCurrentSession();
  const response=NextResponse.json({ok:true});
  response.cookies.set({...sessionCookie(""),maxAge:0});
  return response;
 }catch(e){return failure(e)}
}
