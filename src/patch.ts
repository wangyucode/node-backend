
import { logger } from "./log";
import { COLLECTIONS, CONFIG_KEYS, db } from "./mongo";

const PATCH_RECORD_NUM = 1;

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
    const blogs = await db.collection(COLLECTIONS.ACCESS_COUNT).find(
        { _id: { $regex: /^\d{4}-\d{2}-\d{2}-[\w-]+\.html$/ } }
    ).toArray();

    if (blogs.length) {
        blogs.map(v => {
            v._id = v._id.match(/^(\d{4}-\d{2}-\d{2}-)?([\w-\/]+\.html)$/)[2].replace(/_/, '-');
            v.url = `/${v._id}`;
            return v;
        });

        const insert = await db.collection(COLLECTIONS.ACCESS_COUNT).insertMany(blogs)
        logger.info(`inserted: ${insert.insertedCount}`);

        const deleted = await db.collection(COLLECTIONS.ACCESS_COUNT).deleteMany({ _id: { $regex: /^\d{4}-\d{2}-\d{2}-[\w-]+\.html$/ } });
        logger.info(`deleted: ${deleted.deletedCount}`);
    }

}