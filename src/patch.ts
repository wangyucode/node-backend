
import { formatISO, parseISO, subDays } from "date-fns";
import { logger } from "./log";
import { ADMIN_EMAIL, email } from "./mail";
import { COLLECTIONS, CONFIG_KEYS, db } from "./mongo";
import { isProd } from "./utils";

const PATCH_RECORD_NUM = 4;

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
    logger.info(await db.collection(COLLECTIONS.ACCESS_COUNT).deleteMany(
        { _id: { $regex: /^[\w-\/]+\.html$/ } },
    ));

    logger.info(await db.collection(COLLECTIONS.ACCESS_COUNT).updateMany({}, { $unset: { pre_monthly: "", pre_yearly: "", pre_weekly: "", yearly: "" } }));

    const result = await db.collection(COLLECTIONS.APP_ACCESS_RECORD).findOne({ _id: 'all' });

    result.records = result.records.map(record => {
        record.date = formatISO(subDays(parseISO(record.date), 1), { representation: 'date' });
        return record;
    });

    logger.info(await db.collection(COLLECTIONS.ACCESS_COUNT).updateOne({ _id: 'all' }, { $set: { records: result.records } }));
    logger.info(await db.collection(COLLECTIONS.ACCESS_COUNT).updateOne({ _id: 'comments' }, { $set: { records: [] } }));
    logger.info(await db.collection(COLLECTIONS.ACCESS_COUNT).updateOne({ _id: 'dota' }, { $set: { records: [] } }));
    logger.info(await db.collection(COLLECTIONS.ACCESS_COUNT).updateOne({ _id: 'clipboard' }, { $set: { records: [] } }));

    return logger.info(await db.dropCollection(COLLECTIONS.APP_ACCESS_RECORD))
}