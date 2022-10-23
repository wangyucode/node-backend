import { CronJob } from 'cron';
import axios from 'axios';

import { setConfig } from './admin/common';
import { processNginxLog } from './analysis/nginx-log';
import { COLLECTIONS, CONFIG_KEYS, db } from './mongo';
import { logger } from './log';
import { isProd } from './utils';
import { clearRooms } from './public/dealer';


export default function setupCron() {
    if (!isProd()) return;
    // 10:00:00 every Tuesday
    const weeklyJob = new CronJob('0 0 10 * * 2', function () {
        logger.info("weeklyJob started!");
        getLeaderBoard();
        removeOldNews();
    });
    logger.info('weeklyJob->', weeklyJob.nextDates(3));
    weeklyJob.start();

    // 00:00:00 every day
    const dailyJob = new CronJob('0 0 0 * * *', function () {
        logger.info("dailyJob started!");
        processNginxLog();
        clearRooms();
    });
    logger.info('dailyJob->', dailyJob.nextDates(3));
    dailyJob.start();
}

async function getLeaderBoard() {
    const url = Buffer.from('aHR0cDovL3d3dy5kb3RhMi5jb20vd2ViYXBpL0lMZWFkZXJib2FyZC9HZXREaXZpc2lvbkxlYWRlcmJvYXJkL3YwMDAxP2RpdmlzaW9uPWNoaW5hJmxlYWRlcmJvYXJkPTA=', "base64").toString('utf-8');
    logger.info(url);
    const res = await axios.get(url);
    logger.info('getLeaderBoard->', res.data.leaderboard.length);
    if (res.data.leaderboard.length) {
        const ctx: any = {
            query: {
                k: CONFIG_KEYS.CONFIG_DOTA_LEADERBOARD,
                v: res.data.leaderboard
            }
        }

        await setConfig(ctx);
    }
}

async function removeOldNews() {
    const nc = db.collection(COLLECTIONS.DOTA_NEWS);
    const result = nc.find(null, {
        sort: {
            date: 1,
        }
    });

    while (await result.hasNext()) {
        const news = await result.next();
        const date = new Date(news.date);
        // if news date > 150 days
        if (new Date().getTime() - date.getTime() > 24 * 3600 * 1000 * 365) {
            await nc.deleteOne({ _id: news._id });
            logger.info('remove news:', date);
        } else {
            break;
        }
    }
}
