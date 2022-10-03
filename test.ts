import { info } from "console";
import { formatISO, parse, parseISO, subDays, subHours } from "date-fns";
import { processNginxLog } from "./src/analysis/nginx-log";
import { logger } from "./src/log";
import { COLLECTIONS, connectToDb, db } from "./src/mongo";
import applyPatch from "./src/patch";
import { getAll, getApps, getBlogs, getErrors } from "./src/public/analysis";

const ctx: any = { query: { size: 10, status: '400' } };

async function test() {
    await connectToDb();
    // await processNginxLog();

    process.exit(0);
}

test();

