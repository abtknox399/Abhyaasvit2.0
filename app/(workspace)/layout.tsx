import {requireUser} from "@/lib/auth";
import {WorkspaceShell} from "@/components/workspace-shell";
export default async function Layout({children}:{children:React.ReactNode}){
 const user=await requireUser();
 return <WorkspaceShell initialUser={user}>{children}</WorkspaceShell>;
}
