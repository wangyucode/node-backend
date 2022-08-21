import { formatISO, subDays, subHours } from "date-fns";
import { logger } from "./src/log";
import { COLLECTIONS, connectToDb, db } from "./src/mongo";
import applyPatch from "./src/patch";
import { getAll, getApps, getBlogs, getErrors } from "./src/public/analysis";

const ctx: any = { query: { size: 10, status: '400' } };

async function test() {
    await connectToDb();
    await applyPatch();
    //     await getErrors(ctx)
    logger.info(await db.collection(COLLECTIONS.CLIPBOARD).find({ tips: { $nin: [null, ''] } }).toArray());
}

test();

