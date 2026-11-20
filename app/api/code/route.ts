import {NextResponse} from "next/server";
import {apiUser,unauthorized,bad,jsonBody,asString} from "@/lib/api";
export const runtime="nodejs";
export async function POST(request:Request){
 const user=await apiUser();if(!user)return unauthorized();
 const body=await jsonBody(request),code=asString(body?.code,8000),language=asString(body?.language,20);
 const supported=new Set(["python","c","cpp","java"]);
 if(!supported.has(language)||!code)return bad("Unsupported code input");
 const endpoint=process.env.CODE_RUNNER_ENDPOINT;
 if(!endpoint)return NextResponse.json({error:"An isolated code execution provider has not been configured. Use the syntax editor and math scratchpad for now."},{status:503});
 try{
  const url=new URL(endpoint);
  if(url.protocol!=="https:")return NextResponse.json({error:"Runner configuration must use HTTPS"},{status:503});
  const response=await fetch(url.toString(),{method:"POST",signal:AbortSignal.timeout(12000),
   headers:{"Content-Type":"application/json",...(process.env.CODE_RUNNER_API_KEY?{"X-Runner-Key":process.env.CODE_RUNNER_API_KEY}:{})},
   body:JSON.stringify({language,code,timeoutMs:6000,memoryMb:128})});
  if(!response.ok)throw Error("Runner rejected request");
  const result=await response.json();
  return NextResponse.json({stdout:String(result.stdout||"").slice(0,5000),
   stderr:String(result.stderr||"").slice(0,3000),exitCode:Number(result.exitCode||0)});
 }catch{return NextResponse.json({error:"Isolated runner unavailable"},{status:503})}
}
