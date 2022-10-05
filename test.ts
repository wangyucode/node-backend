
import {last,head} from "lodash";
import { format, formatDistanceStrict, formatISO, parse, parseISO, subDays, subHours } from "date-fns";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { processNginxLog } from "./src/analysis/nginx-log";
import { logger } from "./src/log";
import { COLLECTIONS, connectToDb, db } from "./src/mongo";
import applyPatch from "./src/patch";



async function test() {
    await connectToDb();
    
    const date = head([1,3,3]);
    debugger
    process.exit(0);
}

test();

