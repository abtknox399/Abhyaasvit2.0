import {db} from "@/lib/db";
import type {SafeQuestion} from "@/lib/types";
import type {Question} from "@prisma/client";
type JoinedQuestion=Question & {course:{code:string};unit:{number:number;title:string};topic:{title:string}|null};
export function presentQuestion(q:JoinedQuestion):SafeQuestion{
 return {id:q.id,courseCode:q.course.code,unitNumber:q.unit.number,unitTitle:q.unit.title,
  topic:q.topic?.title||q.unit.title,coCode:q.coCode,type:q.type,
  source:q.source,verified:q.verified,stem:q.stem,code:q.code,diagramUrl:q.diagramUrl,
  options:q.options as SafeQuestion["options"],maxMarks:q.maxMarks,idealSeconds:q.idealSeconds,difficulty:q.difficulty};
}
export const questionInclude={course:{select:{code:true}},unit:{select:{number:true,title:true}},topic:{select:{title:true}}} as const;
export async function availableCourses(){
 return db.course.findMany({orderBy:[{year:"asc"},{semester:"asc"},{title:"asc"}],
  include:{units:{orderBy:{number:"asc"},include:{topics:{orderBy:{title:"asc"}},_count:{select:{questions:true}}}}}});
}
