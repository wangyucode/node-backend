import {CronJob} from 'cron';
import { logger } from './log';
import * as fetch from 'node-fetch';

export let leaderboard = []

export default function setupCron(){
    const dailyJob = new CronJob('0 0 10 * * *', function () {
        logger.info("corn job started!");
        getLeadboad();
    });
    logger.debug(dailyJob.nextDates(3));
    dailyJob.start();
    
    getLeadboad();
}

async function getLeadboad(){
    const url = Buffer.from('aHR0cDovL3d3dy5kb3RhMi5jb20vd2ViYXBpL0lMZWFkZXJib2FyZC9HZXREaXZpc2lvbkxlYWRlcmJvYXJkL3YwMDAxP2RpdmlzaW9uPWNoaW5hJmxlYWRlcmJvYXJkPTA=', "base64").toString('utf-8');
    logger.info(url);
    const res = await fetch(url);
    const json = await res.json();
    logger.info(json);
    leaderboard = json.leaderboard;
}