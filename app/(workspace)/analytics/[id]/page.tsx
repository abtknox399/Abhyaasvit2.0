import {AnalyticsView} from "@/components/analytics-view";
export const metadata={title:"15-Section Test Analytics"};
export default async function Page({params}:{params:Promise<{id:string}>}){
 const {id}=await params;return <AnalyticsView id={id}/>;
}
