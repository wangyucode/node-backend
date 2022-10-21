

import { COLLECTIONS, connectToDb, db} from "./src/mongo";
import { Context } from "koa";
import { getWechatApps } from "./src/public/common";

async function test() {
    await connectToDb();
    // const context: Context = {headers: {referer: 'https://servicewechat.com/wx8a383e1143f5b2c9/devtools/page-frame.html'}} as any;
    // await getWechatApps(context);
    // const it = await db.collection(COLLECTIONS.COMMENT).findOne({topic: {$regex: /[\w-]+\.html$/}});
    // const a = await db.collection(COLLECTIONS.COMMENT).updateOne({_id:it._id}, {$set: {topic: 'raspberrypi-fish'}});
    const a = await db.collection(COLLECTIONS.COMMENT).find({topic: {$regex: /[\w-]+\.html$/}}).toArray();
    const b = a.map(it => {
        const topic = it.topic.match(/([\w-]+)\.html$/)[1];
        return db.collection(COLLECTIONS.COMMENT).updateOne({_id:it._id}, {$set: {topic}});
    });

    await Promise.all(b);
    debugger;
    process.exit(0);
}

test();

