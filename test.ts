
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



async function test() {
    // await connectToDb();
    const a = /^\/blog\/[\w-]+\/$/.test('/blog/highlight/')
    const b = '/blog/highlight/'.match(/^\/blog\/([\w-]+)\/$/)
    '/blog/tag/virtualbox/'
    debugger;
    process.exit(0);
}

test();

