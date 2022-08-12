
import { logger } from "./log";
import { COLLECTIONS, CONFIG_KEYS, db } from "./mongo";

const PATCH_RECORD_NUM = 2;

export default async function applyPatch() {
    const patchRecord = await db.collection(COLLECTIONS.CONFIG).findOne({ _id: CONFIG_KEYS.CONFIG_PATCH_RECORD });

    if (!patchRecord || patchRecord.value < PATCH_RECORD_NUM) {
        logger.info(`start patch: ${PATCH_RECORD_NUM}`);
        await doPatch();
        await db.collection(COLLECTIONS.CONFIG).updateOne({ _id: CONFIG_KEYS.CONFIG_PATCH_RECORD },
            {
                $set: { _id: CONFIG_KEYS.CONFIG_PATCH_RECORD, value: PATCH_RECORD_NUM, date: new Date() }
            },
            { upsert: true }
        );
        logger.info(`patch: ${PATCH_RECORD_NUM} successfully`);
    } else {
        logger.info(`no need to patch record: ${patchRecord.value}`);
    }
}

async function doPatch() {
   await db.collection(COLLECTIONS.APP_ACCESS_RECORD).insertOne({_id: 'all', records: []});
}