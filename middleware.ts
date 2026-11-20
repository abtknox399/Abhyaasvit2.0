import {NextRequest,NextResponse} from "next/server";
const CANONICAL="www.abhyaasvit.space";
const ALLOWED=new Set([CANONICAL,"abhyaasvit.space"]);
const UNSAFE=new Set(["POST","PUT","PATCH","DELETE"]);
function addSecurityHeaders(response:NextResponse){
 response.headers.set("X-Content-Type-Options","nosniff");
 response.headers.set("Referrer-Policy","strict-origin-when-cross-origin");
 response.headers.set("X-Frame-Options","DENY");
 response.headers.set("Permissions-Policy","camera=(), microphone=(), geolocation=()");
 if(process.env.VERCEL_ENV==="production"){
  response.headers.set("Strict-Transport-Security","max-age=31536000; includeSubDomains");
 }
 return response;
}
export function middleware(request:NextRequest){
 const {pathname,search}=request.nextUrl;
 const host=(request.headers.get("host")||request.nextUrl.host).toLowerCase().split(":")[0];
 const local=["localhost","127.0.0.1"].includes(host);
 // Remove all publicly reachable Vercel deployment hostnames from the user-facing URL.
 // Local and test environments retain their own hosts.
 if(process.env.VERCEL_ENV==="production"&&!local&&(!ALLOWED.has(host)||host!==CANONICAL)){
  const url=new URL("https://"+CANONICAL+pathname+search);
  return addSecurityHeaders(NextResponse.redirect(url,308));
 }
 if(pathname.startsWith("/api/")&&UNSAFE.has(request.method)){
  const site=request.headers.get("sec-fetch-site");
  const origin=request.headers.get("origin");
  if(site==="cross-site")return addSecurityHeaders(NextResponse.json({error:"Cross-site request blocked"},{status:403}));
  if(origin){
   try{
    const parsed=new URL(origin);
    const secure=process.env.VERCEL_ENV!=="production"||parsed.protocol==="https:";
    if(!secure||parsed.hostname.toLowerCase()!==host){
     return addSecurityHeaders(NextResponse.json({error:"Invalid request origin"},{status:403}));
    }
   }catch{
    return addSecurityHeaders(NextResponse.json({error:"Invalid request origin"},{status:403}));
   }
  }
 }
 return addSecurityHeaders(NextResponse.next());
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
