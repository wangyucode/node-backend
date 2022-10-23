

import { COLLECTIONS, connectToDb, db} from "./src/mongo";
import { Context } from "koa";
import { getWechatApps } from "./src/public/common";
import { getNews } from "./src/public/dota";
import { join } from "./src/public/dealer";

async function test() {
    // await connectToDb();
    // const context: Context = {query: {size: 10, version: '1.8'}} as any;
    // await join(context);

    const a =  new Map();

    a.set(1, 'a');
    a.set(2, 'b');
    a.set(3, 'c');
    a.set(4, 'd');

    for (const key of a){
        console.log(key);
        if (key[0] == 2) a.delete(2);
    }

    debugger;
    process.exit(0);
}

test();

