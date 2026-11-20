import "dotenv/config";
import {PrismaClient} from "@prisma/client";
import assert from "node:assert/strict";
import {checkAnswer,pointFor,quadrant} from "../lib/scoring";
import {evaluateArithmetic} from "../lib/calculator";
const db=new PrismaClient();
async function run(){
 const courses=await db.course.count(),questions=await db.question.count(),templates=await db.testTemplate.count();
 assert.ok(courses>=13,"Seed should include FY plus explicitly demo-labelled SY courses");
 assert.ok(questions>=25,"Expected original LaTeX and code problems");
 assert.ok(templates>=4,"Expected working mock templates");
 assert.equal(checkAnswer("MCQ","B","b"),true);
 assert.equal(checkAnswer("NUMERICAL","4","4.0"),true);
 assert.equal(checkAnswer("SUBJECTIVE","test","test"),false);
 assert.equal(pointFor({type:"MCQ",correctAnswer:"A",maxMarks:4,negativeMarks:1},"B"),-1);
 assert.equal(quadrant(false,200,120),"Overtime / Incorrect");
 assert.equal(evaluateArithmetic("(24+16)/8"),5);
 assert.equal(evaluateArithmetic("3*-2"),-6);
 assert.equal(evaluateArithmetic("-(5-2)"),-3);
 const q=await db.question.findFirstOrThrow();
 const user=await db.user.findFirstOrThrow({where:{email:"demo@abhyaasvit.test"}});
 const test=await db.testAttempt.create({data:{userId:user.id,title:"CI smoke test",kind:"UNIT",durationSeconds:600,
  deadlineAt:new Date(Date.now()+600000),items:{create:[{questionId:q.id,position:0}]}}});
 const seen=await db.testAttempt.findUniqueOrThrow({where:{id:test.id},include:{items:true}});
 assert.equal(seen.items.length,1);
 await db.testAttempt.delete({where:{id:test.id}});
 console.log("Smoke test OK: "+courses+" courses, "+questions+" original questions, "+templates+" tests.");
}
run().then(()=>db.$disconnect()).catch(async e=>{console.error(e);await db.$disconnect();process.exitCode=1});
