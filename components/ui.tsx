import * as React from "react";
import {Slot} from "@radix-ui/react-slot";
import {cva,type VariantProps} from "class-variance-authority";
import {clsx,type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";
export const cn=(...classes:ClassValue[])=>twMerge(clsx(classes));
const variants=cva("inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50",
 {variants:{variant:{default:"bg-indigo-600 text-white hover:bg-indigo-700",secondary:"border border-slate-200 bg-white text-slate-700 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white",
 ghost:"text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",danger:"bg-red-600 text-white hover:bg-red-700"},
 size:{default:"h-10 px-4",sm:"h-8 px-3",lg:"h-12 px-6",icon:"h-10 w-10"}},
 defaultVariants:{variant:"default",size:"default"}});
type ButtonProps=React.ButtonHTMLAttributes<HTMLButtonElement>&VariantProps<typeof variants>&{asChild?:boolean};
export const Button=React.forwardRef<HTMLButtonElement,ButtonProps>(({className,variant,size,asChild,...props},ref)=>{
 const Comp=asChild?Slot:"button";
 return <Comp ref={ref} className={cn(variants({className,variant,size}))} {...props}/>;
});
Button.displayName="Button";
export function Card({children,className,...props}:React.HTMLAttributes<HTMLDivElement>){
 return <div className={cn("panel",className)} {...props}>{children}</div>;
}
export function Badge({children,className}:React.HTMLAttributes<HTMLSpanElement>){
 return <span className={cn("tag",className)}>{children}</span>;
}
