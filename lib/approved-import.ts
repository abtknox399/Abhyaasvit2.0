import {z} from "zod";
export const draftedQuestion=z.object({
 unit:z.coerce.number().int().min(1).max(12),
 type:z.enum(["MCQ","NUMERICAL","CODE_OUTPUT","SUBJECTIVE"]),
 stem:z.string().trim().min(12).max(5000),
 correctAnswer:z.string().trim().min(1).max(1000),
 solution:z.string().trim().min(15).max(10000),
 concept:z.string().trim().max(1500).optional(),
 topic:z.string().trim().max(150).optional(),
 code:z.string().max(3000).optional(),
 options:z.array(z.object({id:z.enum(["A","B","C","D"]),text:z.string().trim().min(1).max(1000)})).length(4).optional(),
 maxMarks:z.coerce.number().int().min(1).max(20).default(4),
 idealSeconds:z.coerce.number().int().min(15).max(1500).default(120),
 rubric:z.array(z.object({step:z.string().trim().min(4).max(250),marks:z.number().nonnegative().max(20)})).max(20).optional()
}).superRefine((q,ctx)=>{
 if(q.type==="MCQ"){
  if(q.options?.map(o=>o.id).join(",")!=="A,B,C,D")ctx.addIssue({code:"custom",message:"MCQs require exactly A, B, C and D options"});
  if(!["A","B","C","D"].includes(q.correctAnswer))ctx.addIssue({code:"custom",message:"MCQ key must be A, B, C or D"});
 }
 if(q.type==="CODE_OUTPUT"&&!q.code)ctx.addIssue({code:"custom",message:"Code-output questions require a code snippet"});
 if(q.type==="NUMERICAL"&&!Number.isFinite(Number(q.correctAnswer)))ctx.addIssue({code:"custom",message:"Numerical key must be a finite number"});
 if(q.type==="SUBJECTIVE"&&!q.rubric?.length)ctx.addIssue({code:"custom",message:"Descriptive questions need a stepwise marking rubric"});
});
export const approvedQuestions=z.array(draftedQuestion).min(1).max(60);
export const approvedCatalog=z.object({
 courseCode:z.string().regex(/^[A-Z0-9-]{4,32}$/),
});
export type ApprovedDraft=z.infer<typeof draftedQuestion>;
