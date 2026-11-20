import {NextRequest,NextResponse} from "next/server";
import {db} from "@/lib/db";
import {apiUser,unauthorized,bad,forbidden,failure,jsonBody,asString} from "@/lib/api";
export async function GET(req:NextRequest){
 const user=await apiUser();if(!user)return unauthorized();
 const year=req.nextUrl.searchParams.get("year")||user.academicYear,semester=Number(req.nextUrl.searchParams.get("semester")||user.semester);
 if(!/^20\d\d-20\d\d$/.test(year)||semester<1||semester>8)return bad("Invalid academic selection");
 try{
  const events=await db.examScheduleEvent.findMany({where:{academicYear:year,semester,
   OR:[{officialVerified:true,branch:"ALL"},{officialVerified:true,branch:user.branch},{createdById:user.id}]},
   orderBy:{startsAt:"asc"},take:100,include:{course:{select:{code:true,title:true}}}});
  return NextResponse.json({events},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return failure(e)}
}
export async function POST(request:Request){
 const user=await apiUser();if(!user)return unauthorized();
 const b=await jsonBody(request),title=asString(b?.title,140),examType=asString(b?.examType,25);
 const academicYear=asString(b?.academicYear,12),semester=Number(b?.semester),branch=asString(b?.branch,35)||"ALL";
 const verified=b?.officialVerified===true;
 const date=typeof b?.startsAt==="string"&&b.startsAt?new Date(b.startsAt):null;
 const courseCode=asString(b?.courseCode,40);
 if(verified&&user.role!=="ADMIN")return forbidden();
 if(!title||!["ISE","MSE","ESE","LAB","VIVA","CUSTOM"].includes(examType)||!/^20\d\d-20\d\d$/.test(academicYear)||
  !Number.isInteger(semester)||semester<1||semester>8||(date&&!Number.isFinite(date.getTime())))return bad("Invalid exam details");
 if(verified&&(!date||!/^https:\/\//i.test(asString(b?.sourceUrl,500))))return bad("Official dates require an exact time and HTTPS official source.");
 try{
  const course=courseCode?await db.course.findUnique({where:{code:courseCode},select:{id:true}}):null;
  if(courseCode&&!course)return bad("Unknown course");
  const event=await db.examScheduleEvent.create({data:{courseId:course?.id,examType,title,academicYear,semester,
   branch:verified?branch:user.branch,startsAt:date,sourceUrl:asString(b?.sourceUrl,500)||null,
   officialVerified:verified,createdById:user.id,
   campus:asString(b?.campus,70)||null,building:asString(b?.building,60)||null,
   room:asString(b?.room,40)||null,seat:verified?null:asString(b?.seat,30)||null,shift:asString(b?.shift,100)||null}});
  return NextResponse.json({event},{status:201});
 }catch(e){return failure(e)}
}
