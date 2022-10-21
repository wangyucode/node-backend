import { logger } from "./log";
import { ADMIN_EMAIL, email } from "./mail";
import { COLLECTIONS, CONFIG_KEYS, db } from "./mongo";
import { isProd } from "./utils";

const PATCH_RECORD_NUM = 7;

export default async function applyPatch() {
    const patchRecord = await db.collection(COLLECTIONS.CONFIG).findOne({ _id: CONFIG_KEYS.CONFIG_PATCH_RECORD });

    if (!patchRecord || patchRecord.value < PATCH_RECORD_NUM) {
        logger.info(`start patch: ${PATCH_RECORD_NUM}`);
        const result = await doPatch();
        await db.collection(COLLECTIONS.CONFIG).updateOne({ _id: CONFIG_KEYS.CONFIG_PATCH_RECORD },
            {
                $set: { _id: CONFIG_KEYS.CONFIG_PATCH_RECORD, value: PATCH_RECORD_NUM, date: new Date() }
            },
            { upsert: true }
        );
        const message = `patch: ${PATCH_RECORD_NUM} successfully`;
        logger.info(message, result);
        isProd() && email(ADMIN_EMAIL, message, JSON.stringify(result));
    } else {
        logger.info(`no need to patch record: ${patchRecord.value}`);
    }
}

async function doPatch(): Promise<any> {
    const a = await db.collection(COLLECTIONS.COMMENT).find({topic: {$regex: /[\w-]+\.html$/}}).toArray();
    const b = a.map(it => {
        const topic = it.topic.match(/([\w-]+)\.html$/)[1];
        return db.collection(COLLECTIONS.COMMENT).updateOne({_id:it._id}, {$set: {topic}});
    });

    await Promise.all(b);
    return b.length;
}
