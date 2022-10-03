
import { formatISO, parse, subDays } from "date-fns";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { logger } from "./log";
import { ADMIN_EMAIL, email } from "./mail";
import { COLLECTIONS, CONFIG_KEYS, db } from "./mongo";
import { isProd } from "./utils";

const PATCH_RECORD_NUM = 5;
let appAccess = new Map();

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
    const readStream = createReadStream('./log/access.20221004.log');
    const rl = createInterface({
        input: readStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const params = line.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) - .+ \[(.*)\] "(.*)" (\d{3}) \d+ ".*" "(.*)"$/);

        if (!params) {
            logger.error('Unexpected line:', line);
            continue;
        }

        const ip = params[1];
        const time = parse(params[2], 'dd/MMM/yyyy:HH:mm:ss xxxx', new Date());
        const request = params[3];
        const status = parseInt(params[4]);
        const agent = params[5];

        const requestParams = request.match(/^([A-Z]{3,}) (.+) HTTP\/\d\.\d$/);
        let url;
        let method;
        if (requestParams) {
            method = requestParams[1];
            url = requestParams[2];
        }

        const record = { ip, time, method, url, status, request, agent };

        // invaild request
        if (!record.url || record.status != 200) {
            continue;
        }

        // blog
        if (/^\/blog\/[\w-]+$/.test(record.url)) {
            const matches = record.url.match(/^\/blog\/([\w-]+)$/);
            if (matches) {
                await addCount(`blog_${matches[1]}`, record.url);
            } else {
                logger.warn('unexpected blog URL: ' + record.url);
            }
        } else if (/^\/node\/dota.*/.test(record.url)) { // dota
            // await addCount('dota', '/node/dota');
        } else if (/^\/node\/comments.*/.test(record.url)) { // comments
            // await addCount('comments', '/node/comments');
        } else if (/^\/node\/clipboard.*/.test(record.url)) { // clipboard
            // await addCount('clipboard', '/node/clipboard');
        } else if (/^\/node\/.*/.test(record.url)) { // other apps
            await addCount('other', '/node/*');
        } else if (/^\/(dota2static)|(esportsadmin)\/.*/.test(record.url)) { // dota image proxy
            await addCount('proxy', 'dota2static,esportsadmin');
        } else if (/\.(js)|(css)|(xml)|(svg)|(jpe?g)|(png)|(html)|(txt)|(ico)|(apk)|(mp4)$/.test(record.url)) {
            // ignore static files
        } else if (/^\/blog\/(page)|(tags)|(category)\/.+$/.test(record.url)) {
            // ignore /blog/page, /blog/tags, /blog/category
        } else if (record.url === '/') {
            // ignore /
        } else if (record.url.startsWith('/mongo')) {
            // ignore /
        } else {
            logger.warn('unexpected URL: ' + record.url);
        }
    }

    rl.close();

    for (const [key, value] of appAccess) {
        const record = await db.collection(COLLECTIONS.ACCESS_COUNT).findOne({ _id: key })
            || {
            records: [],
            pre_daily: 0,
            total: 0,
            weekly: 0,
            monthly: 0,
            daily: 0
        };
        record.records.push({ date: formatISO(subDays(new Date(), 1), { representation: 'date' }), pv: value.pv });
        record.pre_daily = record.daily;
        record.url = value.url;
        record.daily = value.pv;
        record.total += value.pv;
        record.weekly += value.pv;
        record.monthly += value.pv;
        if (record.records.length > 7) record.weekly -= record.records[record.records.length - 8].pv;
        if (record.records.length > 30) record.monthly -= record.records.shift().pv;
        console.log(record);
        await db.collection(COLLECTIONS.ACCESS_COUNT).updateOne({ _id : key}, { $set: record }, { upsert: true });
    }
    const result = appAccess.toString();
    appAccess = null;
    return result;
}

async function addCount(_id: string, url: string) {
    let record = appAccess.get(_id);
    if (record) {
        record.pv += 1;
    } else {
        record = { _id, url, pv: 1 }
    }

    appAccess.set(_id, record);
}