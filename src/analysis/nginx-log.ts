import { format, formatISO, parse, subDays } from 'date-fns';
import { createReadStream } from 'fs';
import { copyFile, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { createInterface } from 'readline';

import { logger } from '../log';
import { COLLECTIONS, db } from '../mongo';

interface AccessRecord {
    url?: string;
    method?: string;
    ip: string;
    time: Date;
    status: number;
    agent: string;
    request: string;
}

let pv: number;
let sv: number;
let uv: Set<string>;
let appAccess: Map<string, any>;

export async function processNginxLog(): Promise<void> {
    await removeOldErrors();

    let accessCount = 0;
    const readStream = createReadStream(process.env.NGINX_LOG_PATH);
    const rl = createInterface({
        input: readStream,
        crlfDelay: Infinity
    });

    pv = 0;
    sv = 0;
    uv = new Set();
    appAccess = new Map();
    for await (const line of rl) {
        accessCount++;
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

        const record: AccessRecord = { ip, time, method, url, status, request, agent };

        await processRecord(record);
    }

    rl.close();

    await save('all', '*', { date: formatISO(subDays(new Date(), 1), { representation: 'date' }), pv, sv, uv: uv.size });

    for (const [key, value] of appAccess) {
        await save(key, value.url, { date: formatISO(subDays(new Date(), 1), { representation: 'date' }), pv: value.pv });
    }

    await copyFile(process.env.NGINX_LOG_PATH, `${dirname(process.env.NGINX_LOG_PATH)}/access.${format(new Date(), 'yyyyMMdd')}.log`);

    await writeFile(process.env.NGINX_LOG_PATH, '');

    pv = 0;
    sv = 0;
    uv = null;
    appAccess = null;

    logger.info(`${accessCount} access log processed successfully`);
}

async function save(_id: string, url: string, data: any) {
    const record = await db.collection(COLLECTIONS.ACCESS_COUNT).findOne({ _id })
        || {
        records: [],
        pre_daily: 0,
        total: 0,
        weekly: 0,
        monthly: 0,
        daily: 0
    };
    record.records.push(data);
    record.pre_daily = record.daily;
    record.url = url;
    record.daily = data.pv;
    record.total += data.pv;
    record.weekly += data.pv;
    record.monthly += data.pv;
    if (record.records.length > 7) record.weekly -= record.records[record.records.length - 8].pv;
    if (record.records.length > 30) record.monthly -= record.records.shift().pv;
    console.log(record);
    await db.collection(COLLECTIONS.ACCESS_COUNT).updateOne({ _id }, { $set: record }, { upsert: true });
}


async function removeOldErrors() {
    const now = new Date();
    const removeDate = subDays(now, 7);
    const removeResult = await db.collection(COLLECTIONS.ACCESS_ERROR).deleteMany({ time: { $lt: removeDate } });
    logger.info(`Removed error record ${removeResult.deletedCount} before ${format(removeDate, 'yyyy-MM-dd')}`);
}

async function processRecord(record: AccessRecord): Promise<void> {
    pv++;
    if (record.status === 200) sv++;
    uv.add(record.ip);

    // invaild request
    if (!record.url || record.status != 200) {
        await saveError(record);
        return;
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
        await addCount('dota', '/node/dota');
    } else if (/^\/node\/comments.*/.test(record.url)) { // comments
        await addCount('comments', '/node/comments');
    } else if (/^\/node\/clipboard.*/.test(record.url)) { // clipboard
        await addCount('clipboard', '/node/clipboard');
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

async function addCount(_id: string, url: string) {
    let record = appAccess.get(_id);
    if (record) {
        record.pv += 1;
    } else {
        record = { _id, url, pv: 1 }
    }

    appAccess.set(_id, record);
}

async function saveError(record: AccessRecord) {
    await db.collection(COLLECTIONS.ACCESS_ERROR).insertOne(record);
}

