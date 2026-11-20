import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {apiUser,unauthorized,bad,failure,asString} from "@/lib/api";
import {parseSyllabus,aiStudyKit} from "@/lib/ingestion";
export const runtime="nodejs";
export async function GET(){
 const user=await apiUser();if(!user)return unauthorized();
 try{const imports=await db.syllabusImport.findMany({where:user.role==="ADMIN"?{}:{userId:user.id},
  orderBy:{createdAt:"desc"},take:30,select:{id:true,title:true,sourceType:true,status:true,aiAssisted:true,createdAt:true,parsed:true,generated:true}});
  return NextResponse.json({imports},{headers:{"Cache-Control":"no-store"}});}catch(e){return failure(e)}
}
export async function POST(request:Request){
 const user=await apiUser();if(!user)return unauthorized();
 try{
  const data=await request.formData(),title=asString(data.get("title"),130)||"Untitled academic document";
  const raw=asString(data.get("rawText"),70000),file=data.get("file");
  let text=raw,sourceType="PASTED_TEXT",fileName:null|string=null;
  if(file instanceof File&&file.size>0){
   if(file.size>8*1024*1024)return bad("PDF must be under 8 MB");
   if(file.type!=="application/pdf"&&!file.name.toLowerCase().endsWith(".pdf"))return bad("Only PDF uploads are supported");
   const binary=Buffer.from(await file.arrayBuffer());
   if(binary.subarray(0,5).toString()!=="%PDF-")return bad("Invalid PDF header");
   // pdf-parse is a server-only parser. Student-uploaded bytes are never publicly hosted.
   const parser=(await import("pdf-parse")).default;
   const parsed=await parser(binary);
   text=String(parsed.text||"").slice(0,70000);
   fileName=file.name.slice(0,180);sourceType="PDF";
  }
  if(text.trim().length<25)return bad("Provide at least 25 characters of selectable syllabus/PYQ text. Scanned image PDFs require external OCR.");
  const extracted=parseSyllabus(text,title),generated=await aiStudyKit(text,extracted);
  const item=await db.syllabusImport.create({data:{userId:user.id,title,sourceType,originalFileName:fileName,
   rawText:text,parsed:JSON.parse(JSON.stringify(extracted)),generated:JSON.parse(JSON.stringify(generated.generated)),
   aiAssisted:generated.aiAssisted,status:"DRAFT"}});
  return NextResponse.json({item:{id:item.id,title:item.title,status:item.status,parsed:item.parsed,generated:item.generated,
   aiAssisted:item.aiAssisted},warning:"Draft extraction must be reviewed; uploaded documents do not automatically become verified PYQs."},{status:201});
 }catch(e){return failure(e)}
}
