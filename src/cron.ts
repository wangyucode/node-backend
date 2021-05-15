import { CronJob } from 'cron';
import { logger } from './log';
import * as fetch from 'node-fetch';

export let leaderboard = [];
export let teams = [];

export default function setupCron() {
    const weeklyJob = new CronJob('0 0 10 * * 2', function () {
        logger.info("corn job started!");
        getLeadboad();
        getTeams();
    });
    logger.debug(weeklyJob.nextDates(3));
    weeklyJob.start();

    getLeadboad();
    getTeams();
}

async function getLeadboad() {
    const url = Buffer.from('aHR0cDovL3d3dy5kb3RhMi5jb20vd2ViYXBpL0lMZWFkZXJib2FyZC9HZXREaXZpc2lvbkxlYWRlcmJvYXJkL3YwMDAxP2RpdmlzaW9uPWNoaW5hJmxlYWRlcmJvYXJkPTA=', "base64").toString('utf-8');
    logger.info(url);
    const res = await fetch(url);
    const json = await res.json();
    logger.info(json);
    leaderboard = json.leaderboard;
}

async function getTeams() {
    const url = Buffer.from('aHR0cHM6Ly9kYXRhc2VydmljZS1zZWMudnBnYW1lLmNvbS9kb3RhMi9wcm8vd2Vic2VydmljZS90aTEwL3RlYW0vbGlzdD9nYW1lX3R5cGU9ZG90YSZsaW1pdD0zMA==', "base64").toString('utf-8');
    logger.info(url);
    const res = await fetch(url);
    const json = await res.json();
    
    teams = json.data.map(it => ({
        name: it.team.name,
        logo: it.team.logo,
        nation: it.team.nation,
        rank: it.rank,
        point: it.integral
    }));
    logger.info(teams);
}
