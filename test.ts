

import { connectToDb} from "./src/mongo";
import { Context } from "koa";
import { getWechatApps } from "./src/public/common";

async function test() {
    await connectToDb();
    const context: Context = {headers: {referer: 'https://servicewechat.com/wx8a383e1143f5b2c9/devtools/page-frame.html'}} as any;
    await getWechatApps(context);
    debugger;
    process.exit(0);
}

test();

