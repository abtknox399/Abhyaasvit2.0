import "dotenv/config";
import {PrismaClient,QuestionType,Difficulty,QuestionSource,TestKind} from "@prisma/client";
import {hash} from "bcryptjs";
const db=new PrismaClient();
const FY="https://www.vit.edu/DESH/wp-content/uploads/2026/10/FYBTech_Syllabus_A.Y2026-27-Revision_2.pdf";
type C={code:string;title:string;year:number;semester:number;module:string;branch?:string;units:string[]};
const courses:C[]=[
 {code:"ES26101",title:"Linear Algebra",year:1,semester:1,module:"MODULE_1",units:["Systems of Linear Equations and Rank","Vector Spaces and Subspaces","Inner Product Spaces and Gram–Schmidt","Linear Transformations and Rank–Nullity","Eigenvalues, Eigenvectors and Cayley–Hamilton","Quadratic Forms and SVD"]},
 {code:"ES26104",title:"Programming for Engineers",year:1,semester:1,module:"COMMON",units:["Algorithmic Thinking and Python Basics","Data Types, Operators and Control Flow","Loops and Iteration","Lists, Arrays and Collections","Functions, Recursion and Data Structures","Engineering Problem Solving"]},
 {code:"ES26105",title:"Basics of Engineering",year:1,semester:1,module:"COMMON",units:["Engineering Systems and Measurements","Power, Circuits and Electrical World","Materials, Machines and Manufacturing","Mechanical and Civil Fundamentals","Electronics and Computing","Integrated Engineering Applications"]},
 {code:"ES26103",title:"Logic and Quantitative Aptitude 1",year:1,semester:1,module:"COMMON",units:["Number Systems and Logic","Ratios and Proportions","Percentages and Arithmetic","Reasoning and Combinatorics","Data Interpretation","Applied Quantitative Reasoning"]},
 {code:"ES26106",title:"Universal Human Values",year:1,semester:1,module:"MODULE_1",units:["Human Values","Self and Relationships","Professional Ethics","Society and Responsibility"]},
 {code:"ES26107",title:"Indian Knowledge System",year:1,semester:1,module:"MODULE_1",units:["Indian Knowledge Traditions","Indian Mathematics and Science","Culture and Engineering","Contemporary Applications"]},
 {code:"ES26201",title:"Calculus",year:1,semester:2,module:"MODULE_2",units:["Functions and Limits","Partial Derivatives","Multivariable Calculus","Vector Calculus","Ordinary Differential Equations","Applications"]},
 {code:"ES26205",title:"Engineering Robotics",year:1,semester:2,module:"MODULE_2",units:["Robotics Foundations","Sensors and Actuators","Microcontrollers","Kinematics and Control","Robotics Applications"]},
 {code:"ES26206",title:"Environmental Studies",year:1,semester:2,module:"MODULE_2",units:["Ecology and Environment","Natural Resources","Pollution Control","Sustainability"]},
 {code:"ES26207",title:"Design Thinking and Innovation",year:1,semester:2,module:"MODULE_2",units:["Empathy and Problem Discovery","Ideation","Prototyping","Validation and Innovation"]},
 {code:"DEMO-SY-DS101",title:"Data Structures · SY Demo",year:2,semester:3,module:"COMMON",branch:"CSE-DS",units:["Arrays and Complexity","Linked Lists","Stacks and Queues","Trees","Graphs and Hashing","Sorting and Searching"]},
 {code:"DEMO-SY-DS102",title:"Digital Electronics · SY Demo",year:2,semester:3,module:"COMMON",branch:"CSE-DS",units:["Number Systems","Boolean Algebra","Logic Gates","Sequential Logic","Digital Circuits"]},
 {code:"DEMO-SY-DS103",title:"Differential Equations · SY Demo",year:2,semester:3,module:"COMMON",branch:"CSE-DS",units:["First-Order Equations","Linear Differential Equations","Applications and Models"]},
];
type Q={id:string;code:string;unit:number;topic:string;type:QuestionType;difficulty:Difficulty;stem:string;answer:string;solution:string;concept:string;
 options?:{id:string;text:string}[];codeSnippet?:string;marks?:number;ideal?:number;rubric?:{step:string;marks:number}[]};
const MCQ=QuestionType.MCQ,NUM=QuestionType.NUMERICAL,CODE=QuestionType.CODE_OUTPUT,ESSAY=QuestionType.SUBJECTIVE;
const E=Difficulty.EASY,M=Difficulty.MEDIUM,H=Difficulty.HARD;
const qs:Q[]=[
 {id:"la01",code:"ES26101",unit:1,topic:"Row echelon form",type:ESSAY,difficulty:M,stem:"Find the rank using row operations: $$A=\\begin{bmatrix}1&2&3\\\\2&4&6\\\\1&1&1\\end{bmatrix}$$",answer:"2",solution:"$R_2\\leftarrow R_2-2R_1$ yields a zero row. $R_3\\leftarrow R_3-R_1=(0,-1,-2)$. Two non-zero rows remain, hence $\\mathrm{rank}(A)=2$.",concept:"The rank equals the number of pivots after echelon reduction.",marks:5,rubric:[{step:"Set up correct elementary transformations",marks:1},{step:"Eliminate dependent second row",marks:2},{step:"Reach echelon form",marks:1},{step:"State rank 2",marks:1}]},
 {id:"la02",code:"ES26101",unit:1,topic:"Simultaneous equations",type:NUM,difficulty:E,stem:"If $x+y=7$ and $x-y=1$, enter the value of $x$.",answer:"4",solution:"Adding gives $2x=8$, so $x=4$.",concept:"Eliminate variables by addition.",marks:4},
 {id:"la03",code:"ES26101",unit:1,topic:"Determinants",type:MCQ,difficulty:E,stem:"Evaluate $\\det\\begin{pmatrix}2&1\\\\3&4\\end{pmatrix}$.",options:[{id:"A",text:"$5$"},{id:"B",text:"$8$"},{id:"C",text:"$11$"},{id:"D",text:"$-5$"}],answer:"A",solution:"$ad-bc=2(4)-1(3)=5$.",concept:"For a $2\\times2$ matrix, determinant is $ad-bc$."},
 {id:"la04",code:"ES26101",unit:2,topic:"Linear independence",type:MCQ,difficulty:M,stem:"Are $(1,2,3)$ and $(2,4,6)$ linearly independent?",options:[{id:"A",text:"Yes, both nonzero"},{id:"B",text:"No, one is a scalar multiple"},{id:"C",text:"Yes, in $\\mathbb R^3$"},{id:"D",text:"Cannot determine"}],answer:"B",solution:"Since $v_2=2v_1$, the nontrivial relation $2v_1-v_2=0$ shows dependence.",concept:"A vector pair containing scalar multiples is dependent."},
 {id:"la05",code:"ES26101",unit:2,topic:"Basis and dimension",type:NUM,difficulty:M,stem:"Find $\\dim W$ for $W=\\{(x,y,z)\\in\\mathbb R^3:x+y+z=0\\}$.",answer:"2",solution:"Let $z=-x-y$. A basis is $(1,0,-1)$, $(0,1,-1)$. Therefore $\\dim W=2$.",concept:"Independent linear constraints reduce dimension."},
 {id:"la06",code:"ES26101",unit:3,topic:"Gram–Schmidt",type:ESSAY,difficulty:H,stem:"Orthogonalize $v_1=(1,1)$ and $v_2=(1,0)$ using Gram–Schmidt.",answer:"(1,1),(1,-1)",solution:"$u_1=(1,1)$, and $u_2=v_2-\\frac{\\langle v_2,u_1\\rangle}{\\langle u_1,u_1\\rangle}u_1=(1,0)-\\frac12(1,1)=(\\frac12,-\\frac12)$. A scaled orthogonal basis is $(1,1),(1,-1)$.",concept:"Subtract the projection onto earlier orthogonal vectors.",marks:5,rubric:[{step:"Choose the first orthogonal vector",marks:1},{step:"Write projection formula",marks:2},{step:"Calculate second vector",marks:1},{step:"Check zero inner product",marks:1}]},
 {id:"la07",code:"ES26101",unit:3,topic:"Inner product",type:NUM,difficulty:E,stem:"Compute $\\langle(1,2),(3,4)\\rangle$.",answer:"11",solution:"$1(3)+2(4)=11$.",concept:"A standard real inner product is a dot product."},
 {id:"la08",code:"ES26101",unit:4,topic:"Rank–Nullity",type:NUM,difficulty:M,stem:"If $T:\\mathbb R^5\\to\\mathbb R^3$ has rank $3$, enter its nullity.",answer:"2",solution:"$5=\\operatorname{rank}(T)+\\operatorname{nullity}(T)=3+n$, so $n=2$.",concept:"Rank-nullity sums to the dimension of the domain."},
 {id:"la09",code:"ES26101",unit:5,topic:"Eigenvalues",type:MCQ,difficulty:M,stem:"Find the eigenvalues of $$A=\\begin{bmatrix}2&1&0\\\\0&3&2\\\\0&0&4\\end{bmatrix}$$.",options:[{id:"A",text:"$1,2,3$"},{id:"B",text:"$2,3,4$"},{id:"C",text:"$2,2,4$"},{id:"D",text:"$0,3,4$"}],answer:"B",solution:"A triangular matrix's eigenvalues are its diagonal entries: $2,3,4$.",concept:"For triangular matrices, read the diagonal."},
 {id:"la10",code:"ES26101",unit:5,topic:"Cayley–Hamilton",type:ESSAY,difficulty:H,stem:"Verify Cayley–Hamilton for $$A=\\begin{bmatrix}2&0\\\\0&3\\end{bmatrix}$$.",answer:"A²-5A+6I=0",solution:"Characteristic polynomial is $p(\\lambda)=(\\lambda-2)(\\lambda-3)=\\lambda^2-5\\lambda+6$. Thus $A^2-5A+6I=\\operatorname{diag}(0,0)$.",concept:"Substitute a matrix into its characteristic polynomial.",marks:5,rubric:[{step:"Find characteristic polynomial",marks:2},{step:"Substitute matrix",marks:2},{step:"Verify zero matrix",marks:1}]},
 {id:"la11",code:"ES26101",unit:6,topic:"Quadratic forms",type:MCQ,difficulty:M,stem:"Classify $Q(x,y)=x^2+4y^2$ for nonzero $(x,y)$.",options:[{id:"A",text:"Positive definite"},{id:"B",text:"Negative definite"},{id:"C",text:"Indefinite"},{id:"D",text:"Zero"}],answer:"A",solution:"$Q>0$ for every nonzero real vector.",concept:"A diagonal quadratic form is positive definite if all its coefficients are positive."},
 {id:"pe01",code:"ES26104",unit:1,topic:"Python integer division",type:CODE,difficulty:E,stem:"Predict the printed output.",codeSnippet:"a=8\nb=3\nprint(a//b)",answer:"2",solution:"Floor division gives $8//3=2$.",concept:"Python's // operator floors the quotient."},
 {id:"pe02",code:"ES26104",unit:2,topic:"Operator precedence",type:NUM,difficulty:M,stem:"What integer is printed?",codeSnippet:"print(2 ** 3 ** 2)",answer:"512",solution:"Exponentiation associates right-to-left: $2^{(3^2)}=2^9=512$.",concept:"The exponentiation operator is right-associative."},
 {id:"pe03",code:"ES26104",unit:3,topic:"Python loops",type:CODE,difficulty:M,stem:"Predict the printed output.",codeSnippet:"total=0\nfor i in range(1,5):\n    total+=i\nprint(total)",answer:"10",solution:"Values $1,2,3,4$ sum to $10$.",concept:"The upper bound of range is excluded."},
 {id:"pe04",code:"ES26104",unit:4,topic:"Lists",type:CODE,difficulty:E,stem:"Predict output for negative indexing.",codeSnippet:"a=[3,5,8]\nprint(a[-1])",answer:"8",solution:"Index -1 references the last element.",concept:"Negative indices access elements from the end."},
 {id:"pe05",code:"ES26104",unit:5,topic:"Recursion",type:NUM,difficulty:H,stem:"What is printed?",codeSnippet:"def fact(n):\n    return 1 if n<=1 else n*fact(n-1)\nprint(fact(5))",answer:"120",solution:"$5!=5\\times4\\times3\\times2\\times1=120$.",concept:"Base cases stop recursive descent."},
 {id:"boe01",code:"ES26105",unit:2,topic:"Series resistors",type:NUM,difficulty:E,stem:"Two resistors of $3\\,\\Omega$ and $5\\,\\Omega$ are connected in series. Enter their equivalent resistance.",answer:"8",solution:"$R_{eq}=R_1+R_2=3+5=8\\,\\Omega$.",concept:"Series resistors add."},
 {id:"boe02",code:"ES26105",unit:2,topic:"Ohm's law",type:MCQ,difficulty:E,stem:"A $4\\,\\Omega$ resistor is across $12\\,V$. Find current.",options:[{id:"A",text:"$3\\,A$"},{id:"B",text:"$4\\,A$"},{id:"C",text:"$8\\,A$"},{id:"D",text:"$48\\,A$"}],answer:"A",solution:"$I=V/R=12/4=3\\,A$.",concept:"Ohm's law is $V=IR$."},
 {id:"lqa01",code:"ES26103",unit:2,topic:"Ratios",type:NUM,difficulty:E,stem:"Two numbers are in the ratio $2:3$ and their sum is $40$. Find the smaller.",answer:"16",solution:"$2/(2+3)\\times40=16$.",concept:"Divide the total into ratio parts."},
 {id:"lqa02",code:"ES26103",unit:3,topic:"Percentages",type:NUM,difficulty:E,stem:"Calculate $20\\%$ of $250$.",answer:"50",solution:"$250\\times0.2=50$.",concept:"20 percent equals one fifth."},
 {id:"lqa03",code:"ES26103",unit:4,topic:"Combinations",type:MCQ,difficulty:M,stem:"How many ways are there to choose two students from five?",options:[{id:"A",text:"$5$"},{id:"B",text:"$10$"},{id:"C",text:"$20$"},{id:"D",text:"$25$"}],answer:"B",solution:"$\\binom52=\\frac{5!}{2!3!}=10$.",concept:"When order does not matter, use combinations."},
 {id:"lqa04",code:"ES26103",unit:5,topic:"Averages",type:NUM,difficulty:E,stem:"Find the arithmetic mean of $5,7,9$.",answer:"7",solution:"$(5+7+9)/3=7$.",concept:"Mean equals sum divided by count."},
 {id:"ds01",code:"DEMO-SY-DS101",unit:1,topic:"Time complexity",type:MCQ,difficulty:M,stem:"What is the asymptotic complexity of binary search on a sorted array?",options:[{id:"A",text:"$O(n)$"},{id:"B",text:"$O(\\log n)$"},{id:"C",text:"$O(n^2)$"},{id:"D",text:"$O(1)$"}],answer:"B",solution:"The search interval is halved after each comparison, taking $O(\\log n)$ steps.",concept:"Repeated halving produces logarithmic complexity."},
 {id:"ds02",code:"DEMO-SY-DS101",unit:3,topic:"Queues",type:MCQ,difficulty:E,stem:"Which data structure obeys FIFO?",options:[{id:"A",text:"Stack"},{id:"B",text:"Binary heap"},{id:"C",text:"Queue"},{id:"D",text:"Tree"}],answer:"C",solution:"A queue removes the oldest inserted item first.",concept:"FIFO means first in, first out."},
 {id:"de01",code:"DEMO-SY-DS102",unit:3,topic:"Digital logic",type:MCQ,difficulty:E,stem:"What is output of an AND gate when inputs are $1$ and $0$?",options:[{id:"A",text:"$0$"},{id:"B",text:"$1$"},{id:"C",text:"Undefined"},{id:"D",text:"Oscillating"}],answer:"A",solution:"AND returns one only when both inputs are one.",concept:"AND corresponds to Boolean multiplication."},
 {id:"de02",code:"DEMO-SY-DS103",unit:1,topic:"First-order ODE",type:NUM,difficulty:M,stem:"For $\\frac{dy}{dx}=2x$ and $y(0)=1$, enter $y(2)$.",answer:"5",solution:"Integrating gives $y=x^2+C$, and $C=1$. Hence $y(2)=5$.",concept:"Integrate both sides and use the initial condition."}
];
async function run(){
 const pwd=process.env.DEMO_PASSWORD || "Demo@2026Abhyaas";
 const user=await db.user.upsert({where:{email:"demo@abhyaasvit.test"},create:{email:"demo@abhyaasvit.test",name:"Demo Student",passwordHash:await hash(pwd,12),branch:"CSE-DS"},update:{}});
 await db.userPreference.upsert({where:{userId:user.id},create:{userId:user.id},update:{}});
 const courseIds=new Map<string,string>(),unitIds=new Map<string,string>(),topicIds=new Map<string,string>();
 for(const c of courses){
  const course=await db.course.upsert({where:{code:c.code},create:{code:c.code,title:c.title,year:c.year,semester:c.semester,module:c.module,branch:c.branch||"ALL",sourceUrl:c.year===1?FY:null,officialVerified:false},
   update:{title:c.title,description:"Illustrative units; confirm against official department document before publishing as verified."}});
  courseIds.set(c.code,course.id);
  for(let i=0;i<c.units.length;i++){
   const title=c.units[i];
   const unit=await db.syllabusUnit.upsert({where:{courseId_number:{courseId:course.id,number:i+1}},create:{courseId:course.id,number:i+1,section:i<3?"I":"II",title,coCode:"CO"+(i+1)},update:{title}});
   unitIds.set(c.code+":"+(i+1),unit.id);
   const names=[...new Set(qs.filter(q=>q.code===c.code&&q.unit===i+1).map(q=>q.topic))];
   for(const name of names){
    let topic=await db.syllabusTopic.findFirst({where:{unitId:unit.id,title:name}});
    if(!topic)topic=await db.syllabusTopic.create({data:{unitId:unit.id,title:name,priority:["Eigenvalues","Rank–Nullity","Recursion","Gram–Schmidt"].some(x=>name.includes(x))?"HIGH":"NORMAL"}});
    topicIds.set(c.code+":"+(i+1)+":"+name,topic.id);
   }
  }
 }
 for(const q of qs){
  const code=q.code,unitId=unitIds.get(code+":"+q.unit);
  if(!unitId)throw Error("Unit unavailable for "+q.id);
  const payload={courseId:courseIds.get(code)!,unitId,topicId:topicIds.get(code+":"+q.unit+":"+q.topic),
   type:q.type,difficulty:q.difficulty,source:QuestionSource.ORIGINAL_DEMO,
   stem:q.stem,code:q.codeSnippet||null,options:q.options||undefined,correctAnswer:q.answer,solution:q.solution,
   rubric:q.rubric||undefined,concept:q.concept,maxMarks:q.marks||4,negativeMarks:0,
   idealSeconds:q.ideal||120,coCode:"CO"+q.unit,verified:false};
  await db.question.upsert({where:{id:"demo-"+q.id},create:{id:"demo-"+q.id,...payload},update:{stem:q.stem,solution:q.solution,concept:q.concept}});
 }
 const templates=[
  {id:"demo-la-mse",title:"Linear Algebra · Mid-Sem Practice Simulation",kind:TestKind.MSE,course:"ES26101",minutes:60,ids:["la01","la02","la03","la04","la05","la06","la07"]},
  {id:"demo-la-ese",title:"Linear Algebra · Full Syllabus Mock",kind:TestKind.ESE,course:"ES26101",minutes:120,ids:["la01","la02","la03","la04","la05","la06","la07","la08","la09","la10","la11"]},
  {id:"demo-pfe-speed",title:"Python & Logic · Coding Speed Drill",kind:TestKind.SPEED,course:"ES26104",minutes:20,ids:["pe01","pe02","pe03","pe04","pe05","lqa01","lqa02","lqa03"]},
  {id:"demo-boe-unit2",title:"Basics of Engineering · Circuits Quiz",kind:TestKind.UNIT,course:"ES26105",minutes:15,ids:["boe01","boe02"]},
  {id:"demo-sy-mixed",title:"SY CSE-DS · Foundation Demo",kind:TestKind.FULL,course:"DEMO-SY-DS101",minutes:30,ids:["ds01","ds02","de01","de02"]}
 ];
 for(const t of templates){
  const courseId=courseIds.get(t.course)!;
  await db.testTemplate.upsert({where:{id:t.id},create:{id:t.id,title:t.title,kind:t.kind,courseId,durationMinutes:t.minutes,
   description:"Original practice simulation. Timing and scoring not claimed to match an official VIT examination.",officialPatternVerified:false},update:{title:t.title}});
  for(let i=0;i<t.ids.length;i++){
   await db.testTemplateQuestion.upsert({where:{templateId_position:{templateId:t.id,position:i}},create:{templateId:t.id,questionId:"demo-"+t.ids[i],position:i},update:{questionId:"demo-"+t.ids[i]}});
  }
 }
 const resources=[
  {code:"ES26101",unit:4,kind:"FORMULA",title:"Rank–Nullity theorem",content:"For a linear map $T:V\\to W$, $$\\dim V=\\operatorname{rank}(T)+\\operatorname{nullity}(T)$$. The kernel determines injectivity."},
  {code:"ES26101",unit:3,kind:"FORMULA",title:"Gram–Schmidt recipe",content:"Take $u_1=v_1$ and $$u_k=v_k-\\sum_{j=1}^{k-1}\\frac{\\langle v_k,u_j\\rangle}{\\langle u_j,u_j\\rangle}u_j$$. Normalize if an orthonormal basis is required."},
  {code:"ES26101",unit:5,kind:"NOTES",title:"Eigenvalues quick revision",content:"Solve $\\det(A-\\lambda I)=0$ for eigenvalues, then $(A-\\lambda I)v=0$ for each eigenvector. For triangular matrices eigenvalues are diagonal entries."},
  {code:"ES26104",unit:3,kind:"NOTES",title:"Python loop boundaries",content:"$\\texttt{range(a,b)}$ starts at $a$ and excludes $b$. Beware of accidental extra iterations and mutation inside nested loops."},
  {code:"ES26105",unit:2,kind:"FORMULA",title:"Circuit essentials",content:"Ohm's law: $V=IR$. Series resistors add. Parallel: $1/R=\\sum 1/R_i$. Power: $P=VI=I^2R=V^2/R$."},
  {code:"ES26103",unit:4,kind:"HIGH_WEIGHTAGE",title:"Counting without order",content:"Combination formula: $$\\binom nr=\\frac{n!}{r!(n-r)!}$$. Prefer combinations whenever selecting groups without arranging them."},
  {code:"DEMO-SY-DS101",unit:1,kind:"NOTES",title:"Binary search complexity",content:"A binary search on a sorted random-access array halves its search interval at each step, giving $O(\\log n)$ time."},
  {code:"ES26104",unit:5,kind:"LAB_VIVA",title:"Recursion viva prompts",content:"Explain the base case, recursive call, stack depth, return path, and what happens if recursion never reaches a base case."}
 ];
 for(const r of resources){
  const id="resource-"+r.code+"-"+r.unit+"-"+r.kind;
  await db.resource.upsert({where:{id},create:{id,courseId:courseIds.get(r.code)!,unitId:unitIds.get(r.code+":"+r.unit)!,kind:r.kind,title:r.title,content:r.content,priority:1},update:{title:r.title,content:r.content}});
 }
 console.log("Seeded "+courses.length+" course demos, "+qs.length+" original questions, "+templates.length+" mock templates, "+resources.length+" resources. No official exam dates fabricated.");
}
run().then(()=>db.$disconnect()).catch(async e=>{console.error(e);await db.$disconnect();process.exitCode=1});
