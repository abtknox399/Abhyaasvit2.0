import {NextResponse} from "next/server";
import {sessionUser} from "@/lib/auth";
export const apiUser=sessionUser;
export const unauthorized=()=>NextResponse.json({error:"Please sign in"},{status:401});
export const forbidden=()=>NextResponse.json({error:"Forbidden"},{status:403});
export const bad=(message:string)=>NextResponse.json({error:message},{status:400});
export function failure(error:unknown){
 console.error("[Abhyaas]",error instanceof Error?error.message:"Unknown server error");
 return NextResponse.json({error:"Request could not be completed"},{status:500});
}
export async function jsonBody(request:Request){try{return await request.json()}catch{return null}}
export function asString(v:unknown,max=300){return typeof v==="string"?v.trim().slice(0,max):"";}
