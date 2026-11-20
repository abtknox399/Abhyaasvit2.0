import {PrismaClient} from "@prisma/client";
const scope=globalThis as unknown as {abhyaasDb?:PrismaClient};
export const db=scope.abhyaasDb ?? new PrismaClient({
 log:process.env.NODE_ENV==="development"?["error","warn"]:["error"]
});
if(process.env.NODE_ENV!=="production")scope.abhyaasDb=db;
