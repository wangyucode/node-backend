import { format, formatISO, parse, subDays } from 'date-fns';
import { createReadStream } from 'fs';
import { copyFile, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { createInterface } from 'readline';

import { logger } from '../log';
import { COLLECTIONS, db } from '../mongo';

interface UrlAccessCount {
    _id: string;
    url: string;
    daily: number;
    pre_daily: number;
    weekly: number;
    pre_weekly: number;
    monthly: number;
    pre_monthly: number;
    yearly: number;
    pre_yearly: number;
    total: number;
}

interface AccessRecord {
    url?: string;
    method?: string;
    ip: string;
    time: Date;
    status: number;
    agent: string;
    request: string;
}

export interface AllAccessRecords {
    _id: string;
    records: { date: string, uv: number, pv: number }[]
}

let pv: number;
let uv: Set<string>;

export async function processNginxLog(): Promise<void> {
    await clearCount();

    let accessCount = 0;
    const readStream = createReadStream(process.env.NGINX_LOG_PATH);
    const rl = createInterface({
        input: readStream,
        crlfDelay: Infinity
    });

    pv = 0;
    uv = new Set();
    for await (const line of rl) {
        accessCount++;
        const params = line.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) - .+ \[(.*)\] "(.*)" (\d{3}) \d+ ".+" "(.*)"$/);

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

        await saveToDb(record);
    }

    rl.close();

    await db.collection(COLLECTIONS.APP_ACCESS_RECORD).updateOne({ _id: 'all' }, { $push: {records: { date: formatISO(new Date(), { representation: 'date' }), pv, uv: uv.size }}});

    await copyFile(process.env.NGINX_LOG_PATH, `${dirname(process.env.NGINX_LOG_PATH)}/access.${format(new Date(), 'yyyyMMdd')}.log`);

    await writeFile(process.env.NGINX_LOG_PATH, '');

    logger.info(`${accessCount} access log processed successfully`);
}


async function clearCount() {
    const now = new Date();

    const collection = db.collection(COLLECTIONS.ACCESS_COUNT);

    const removeDate = subDays(new Date(), 7);
    const removeResult = await db.collection(COLLECTIONS.ACCESS_ERROR).deleteMany({ time: { $lt: removeDate } });
    logger.info(`Removed error record ${removeResult.deletedCount} before ${format(removeDate, 'yyyy-MM-dd')}`);
    await collection.updateMany({}, [{ $set: { pre_daily: "$daily", daily: 0 } }]);
    logger.info(`cleared daily records`);
    if (now.getDay() === 0) {
        await collection.updateMany({}, [{ $set: { weekly: 0, pre_weekly: '$weekly' } }]);
        logger.info(`cleared weekly records`);
    }

    if (now.getDate() === 1) {
        await collection.updateMany({}, [{ $set: { monthly: 0, pre_monthly: '$monthly' } }]);
        logger.info(`cleared monthly records`);
        if (now.getMonth() === 0) {
            await collection.updateMany({}, [{ $set: { yearly: 0, pre_yearly: '$yearly' } }]);
            logger.info(`cleared yearly records`);
        }
    }

    // pop app access records
    await db.collection(COLLECTIONS.APP_ACCESS_RECORD).updateOne(
        { _id: 'all', records: { $size: 30 } },
        { $pop: { records: -1 } }
    );
}

async function saveToDb(record: AccessRecord): Promise<void> {
    // all
    await saveCount('all', '*');
    pv++;
    uv.add(record.ip);

    // invaild request
    if (!record.url || record.status >= 400) {
        await saveError(record);
        return;
    }

    // blog
    if (/^\/[\w-\/]+\.html$/.test(record.url)) {
        const matches = record.url.match(/^\/(\d{4}-\d{2}-\d{2}-)?([\w-\/]+\.html)$/);
        if (matches) {
            await saveCount(matches[2], record.url);
        } else {
            logger.warn('unexpected blog URL: ' + record.url);
        }

    } else if (/^\/node\/dota.*/.test(record.url)) { // dota
        await saveCount('dota', '/node/dota');
    } else if (/^\/node\/comments.*/.test(record.url)) { // comments
        await saveCount('comments', '/node/comments');
    } else if (/^\/node\/clipboard.*/.test(record.url)) { // clipboard
        await saveCount('clipboard', '/node/clipboard');
    } else {
        logger.warn('unexpected URL: ' + record.url);
    }
}

async function saveCount(_id: string, url: string) {
    const collection = db.collection(COLLECTIONS.ACCESS_COUNT);
    let accessCount: UrlAccessCount = await collection.findOne({ _id });
    if (accessCount) {
        accessCount.total += 1;
        accessCount.yearly += 1;
        accessCount.monthly += 1;
        accessCount.weekly += 1;
        accessCount.daily += 1;
    } else {
        accessCount = {
            _id,
            url,
            total: 1,
            daily: 1,
            monthly: 1,
            weekly: 1,
            yearly: 1,
            pre_daily: 0,
            pre_monthly: 0,
            pre_weekly: 0,
            pre_yearly: 0
        }
    }

    await collection.updateOne({ _id }, [{ $set: accessCount }], { upsert: true });
}

async function saveError(record: AccessRecord) {
    const collection = db.collection(COLLECTIONS.ACCESS_ERROR);
    await collection.insertOne(record);
}

