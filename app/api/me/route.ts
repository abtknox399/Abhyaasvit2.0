import {NextResponse} from "next/server";
import {apiUser,unauthorized,bad,failure,jsonBody,asString} from "@/lib/api";
import {db} from "@/lib/db";
export async function GET(){
 const user=await apiUser();if(!user)return unauthorized();
 return NextResponse.json({user},{headers:{"Cache-Control":"no-store"}});
}
export async function PATCH(request:Request){
 const user=await apiUser();if(!user)return unauthorized();
 const body=await jsonBody(request),studyYear=Number(body?.studyYear),semester=Number(body?.semester);
 const branch=asString(body?.branch,35),academicYear=asString(body?.academicYear,12);
 if(!Number.isInteger(studyYear)||studyYear<1||studyYear>4||!Number.isInteger(semester)||semester<1||semester>8||
  !["CSE","CSE-DS","IT","AI&DS","EnTC","Mechanical","Electrical","Other"].includes(branch)||!/^20\d\d-20\d\d$/.test(academicYear))
  return bad("Invalid academic profile");
 try{
  const updated=await db.user.update({where:{id:user.id},data:{studyYear,semester,branch,academicYear},
   select:{name:true,branch:true,studyYear:true,semester:true,academicYear:true}});
  return NextResponse.json({ok:true,user:updated});
 }catch(e){return failure(e)}
}
