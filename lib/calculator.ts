// Safe recursive-descent arithmetic parser: no eval/Function/user-provided JS execution.
export function evaluateArithmetic(input:string):number{
 if(input.length>120||!/^[0-9+\-*/().\s]+$/.test(input))throw Error("Only arithmetic is supported");
 const tokens=input.match(/\d+(?:\.\d+)?|\.\d+|[()+\-*/]/g)||[];
 if(!tokens.length||tokens.join("")!==input.replace(/\s/g,""))throw Error("Invalid arithmetic expression");
 let pos=0;
 function primary():number{
  const t=tokens[pos++];
  if(t==="+")return primary();
  if(t==="-")return -primary();
  if(t==="("){
   const value=expression(0);
   if(tokens[pos++]!==")")throw Error("Unbalanced parentheses");
   return value;
  }
  if(!t||!/^(\d+(?:\.\d+)?|\.\d+)$/.test(t))throw Error("Invalid numeric expression");
  return Number(t);
 }
 const precedence:Record<string,number>={"+":1,"-":1,"*":2,"/":2};
 function expression(min:number):number{
  let left=primary();
  while(pos<tokens.length){
   const op=tokens[pos],rank=precedence[op];
   if(rank===undefined||rank<min)break;
   pos++;
   const right=expression(rank+1);
   left=op==="+"?left+right:op==="-"?left-right:op==="*"?left*right:left/right;
   if(!Number.isFinite(left))throw Error("Arithmetic result is undefined or too large");
  }
  return left;
 }
 const value=expression(0);
 if(pos!==tokens.length||!Number.isFinite(value))throw Error("Invalid arithmetic expression");
 return Math.round(value*1e10)/1e10;
}
