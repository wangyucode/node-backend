import { info } from "console";
import { formatISO, parse, parseISO, subDays, subHours } from "date-fns";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { processNginxLog } from "./src/analysis/nginx-log";
import { logger } from "./src/log";
import { COLLECTIONS, connectToDb, db } from "./src/mongo";
import applyPatch from "./src/patch";



async function test() {
    await connectToDb();

    

    process.exit(0);
}

test();

