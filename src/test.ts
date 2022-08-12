import { formatISO, subDays, subHours } from "date-fns";
import { Context } from "koa";
import { logger } from "./log";
import { COLLECTIONS, connectToDb, db } from "./mongo";
import applyPatch from "./patch";
import { getAll, getApps, getBlogs, getErrors } from "./public/analysis";
import { AllAccessRecords, Apps } from "./types";

const ctx = {} as Context;

async function test() {
    await connectToDb();
    await applyPatch();

    for (let i = 0; i < 5; i++) {
        await db.collection(COLLECTIONS.APP_ACCESS_RECORD).updateOne({ _id: 'all' }, { $push: {records: { date: formatISO(new Date(), { representation: 'date' }), pv: i * 3, uv: i * 2 }}});
    }


    await db.collection(COLLECTIONS.APP_ACCESS_RECORD).updateOne(
        { _id: 'all', records: { $size: 5 } },
        { $pop: { records: -1 } }
    );

}

test();

