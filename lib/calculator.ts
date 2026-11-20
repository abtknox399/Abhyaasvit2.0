// Shunting-yard expression evaluator; intentionally no eval, Function, or dynamic execution.
export function evaluateArithmetic(input:string):number{
 if(input.length>120||!/^[0-9+\-*/().\s]+$/.test(input))throw Error("Only arithmetic expressions are supported");
 const tokens=input.match(/\d+(?:\.\d+)?|[()+\-*/]/g)||[];
 const precedence:{[key:string]:number}={"+":1,"-":1,"*":2,"/":2};
 const out:string[]=[],stack:string[]=[];
 for(let i=0;i<tokens.length;i++){
  const t=tokens[i];
  if(/^\d/.test(t))out.push(t);
  else if(t==="(")stack.push(t);
  else if(t===")"){while(stack.length&&stack[stack.length-1]!=="(")out.push(stack.pop()!);if(stack.pop()!=="(")throw Error("Unbalanced brackets")}
  else{
   if(t==="-"&&(i===0||["(","+","-","*","/"].includes(tokens[i-1])))out.push("0");
   while(stack.length&&precedence[stack[stack.length-1]]>=precedence[t])out.push(stack.pop()!);
   stack.push(t);
  }
 }
 while(stack.length){const t=stack.pop()!;if(t==="(")throw Error("Unbalanced brackets");out.push(t)}
 const values:number[]=[];
 for(const t of out){if(/^\d/.test(t))values.push(Number(t));else{
  const b=values.pop(),a=values.pop();if(a===undefined||b===undefined)throw Error("Invalid expression");
  values.push(t==="+"?a+b:t==="-"?a-b:t==="*"?a*b:a/b);
 }}
 if(values.length!==1||!Number.isFinite(values[0]))throw Error("Invalid expression");
 return Math.round(values[0]*1e10)/1e10;
}
