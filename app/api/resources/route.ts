import {NextRequest,NextResponse} from "next/server";
import {db} from "@/lib/db";
import {apiUser,unauthorized,failure} from "@/lib/api";
export async function GET(req:NextRequest){
 if(!(await apiUser()))return unauthorized();
 const course=req.nextUrl.searchParams.get("course")||undefined,kind=req.nextUrl.searchParams.get("kind")||undefined;
 try{
  const resources=await db.resource.findMany({where:{...(course?{course:{code:course}}:{}),...(kind?{kind}:{})},
   include:{course:{select:{code:true,title:true}},unit:{select:{number:true,title:true}}},
   orderBy:[{priority:"asc"},{createdAt:"desc"}],take:250});
  return NextResponse.json({resources},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return failure(e)}
}
