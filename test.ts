

import { COLLECTIONS, connectToDb, db} from "./src/mongo";
import { Context } from "koa";
import { getWechatApps } from "./src/public/common";
import { getNews } from "./src/public/dota";

async function test() {
    await connectToDb();
    const context: Context = {query: {size: 10, version: '1.8'}} as any;
    await getNews(context);

    debugger;
    process.exit(0);
}

test();

