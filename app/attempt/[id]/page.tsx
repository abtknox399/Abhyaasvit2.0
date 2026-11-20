import {requireUser} from "@/lib/auth";
import {CBTRunner} from "@/components/cbt-runner";
export const metadata={title:"CBT Examination"};
export default async function Page({params}:{params:Promise<{id:string}>}){
 await requireUser();const {id}=await params;return <CBTRunner id={id}/>;
}
