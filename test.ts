
import {last,head, isEmpty} from "lodash";
import { format, formatDistanceStrict, formatISO, parse, parseISO, subDays, subHours } from "date-fns";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { processNginxLog } from "./src/analysis/nginx-log";
import { logger } from "./src/log";
import { COLLECTIONS, connectToDb, db } from "./src/mongo";
import applyPatch from "./src/patch";
import { getNews, getNewsDetail } from "./src/public/dota";
import { Context } from "koa";
import { getAppStatus } from "./src/public/common";



async function test() {
    await connectToDb();
    const a = await getAppStatus({query: {a: 'dota', v: '7.32'}} as any);
    debugger;
    process.exit(0);
}

test();

