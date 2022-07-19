import { info } from 'console';
import { parse } from 'date-fns';
import { once } from 'events';
import { createReadStream } from 'fs';
import { writeFile } from 'fs/promises';
import { Collection } from 'mongodb';
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

export async function processNginxLog(): Promise<void> {

    clearCount();

    let accessCount = 0;
    const readStream = createReadStream('/app/nginx/access.log');
    const rl = createInterface({
        input: readStream,
        crlfDelay: Infinity
    });


    rl.on('line', (line) => {
        accessCount++;
        const params = line.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) - .+ \[(.*)\] "(.*)" (\d{3}) \d+ ".+" "(.+)"$/);

        if (!params) {
            logger.error('Unexpected line:', line);
            return;
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
        } else {
            logger.warn(`Invalid request: ${request}`);
        }

        const record: AccessRecord = { ip, time, method, url, status, request, agent };

        saveToDb(record);

    });

    await once(rl, 'close');

    // await writeFile('/app/nginx/access.log', '');

    logger.info(`${accessCount} access log processed successfully`);
}


async function clearCount() {
    const now = new Date();

    const collection = db.collection(COLLECTIONS.ANALYSIS);


    await collection.updateMany({}, { $set: { pre_daily: '$daily' } });
    await collection.updateMany({}, { $set:{daily: 0} });

    if (now.getDay() === 0) {
        await collection.updateMany({}, { weekly: 0, pre_weekly: '$weekly' });
    }

    if (now.getDate() === 1) {
        await collection.updateMany({}, { monthly: 0, pre_monthly: '$monthly' });
        if (now.getMonth() === 0) {
            await collection.updateMany({}, { yearly: 0, pre_yearly: '$yearly' });
        }
    }

}

async function saveToDb(record: AccessRecord): Promise<void> {

    const collection = db.collection(COLLECTIONS.ANALYSIS);

    // logger.info(record);


    if (record.url && /^\/\d{4}-\d{2}-\d{2}-.+\.html$/.test(record.url)) {

        await saveOne(record.url.substring(1), record.url, collection);

    }
}

async function saveOne(_id: string, url: string, collection: Collection) {
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

    await collection.updateOne({ _id }, { $set: accessCount }, { upsert: true });
}
