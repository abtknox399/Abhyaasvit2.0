import {NextResponse} from "next/server";
import {availableCourses} from "@/lib/queries";
import {apiUser,unauthorized,failure} from "@/lib/api";
export async function GET(){
 if(!(await apiUser()))return unauthorized();
 try{
  const courses=await availableCourses();
  return NextResponse.json({courses:courses.map(c=>({id:c.id,code:c.code,title:c.title,year:c.year,
   semester:c.semester,module:c.module,branch:c.branch,officialVerified:c.officialVerified,
   units:c.units.map(u=>({id:u.id,number:u.number,section:u.section,title:u.title,coCode:u.coCode,
    topics:u.topics.map(t=>({id:t.id,title:t.title,priority:t.priority})),questionCount:u._count.questions}))}))},
   {headers:{"Cache-Control":"no-store"}});
 }catch(e){return failure(e)}
}
