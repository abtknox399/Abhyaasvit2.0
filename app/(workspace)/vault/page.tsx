import {VaultView} from "@/components/vault-view";
export const metadata={title:"PYQ & Tutorial Vault"};
export default async function Page({searchParams}:{searchParams:Promise<{course?:string}>}){
 const params=await searchParams;return <VaultView courseHint={params.course}/>;
}
