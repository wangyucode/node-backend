

import { connectToDb} from "./src/mongo";
import { Context } from "koa";
import { getAppStatus, getRecommendedApps } from "./src/public/common";

async function test() {
    await connectToDb();
    const context: Context = {query: {a:'dota', v:'1.8'}} as any;
    await getAppStatus(context);
    debugger;
    process.exit(0);
}

test();

