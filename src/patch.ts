import {last} from "lodash";
import { logger } from "./log";
import { ADMIN_EMAIL, email } from "./mail";
import { COLLECTIONS, CONFIG_KEYS, db } from "./mongo";
import { isProd } from "./utils";

const PATCH_RECORD_NUM = 6;

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
    const accesses = await db.collection(COLLECTIONS.ACCESS_COUNT).find({}).toArray();

    const tasks =  accesses.map(access => {
        const lastRecord = last(access.records);
        if(lastRecord && lastRecord.date === '2022-10-04'){
            lastRecord.date = '10/4';
            return db.collection(COLLECTIONS.ACCESS_COUNT).updateOne({_id: access._id}, {$set: {records: access.records}});
            
        }
    });

    await Promise.all(tasks);
    return tasks.length;
}
