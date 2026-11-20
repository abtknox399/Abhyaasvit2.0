import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {apiUser,unauthorized,bad,forbidden,failure,jsonBody} from "@/lib/api";
type Params={params:Promise<{id:string}>};
export async function PATCH(req:Request,{params}:Params){
 const user=await apiUser();if(!user)return unauthorized();
 const {id}=await params,body=await jsonBody(req),action=String(body?.action||"");
 if(!["review","publish","reject"].includes(action))return bad("Invalid action");
 try{
  const item=await db.syllabusImport.findUnique({where:{id}});
  if(!item)return bad("Document not found");
  if(user.role!=="ADMIN"&&item.userId!==user.id)return forbidden();
  if(action==="publish"&&user.role!=="ADMIN")return forbidden();
  const status=action==="review"?"REVIEWED":action==="publish"?"PUBLISHED":"REJECTED";
  // Publishing approves a staging draft only. It never inserts unverified AI questions into an official PYQ collection.
  await db.syllabusImport.update({where:{id},data:{status}});
  return NextResponse.json({ok:true,status,note:"Review status changed; source provenance and course catalog remain separate."});
 }catch(e){return failure(e)}
}
