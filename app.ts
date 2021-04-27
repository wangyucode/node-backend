import * as Koa from 'koa';
import * as jwt from 'koa-jwt';
import * as Router from '@koa/router';
import { login } from './auth';
import { setNews } from './admin/dota';
import { getNews } from './public/dota';
import bodyParser = require("koa-bodyparser");
import { CronJob } from 'cron';
import * as log4js from 'log4js';
import * as dotenv from 'dotenv';
import { crawlNews } from './crawler/news';

// log
log4js.configure({
    appenders: {
        stdout: { type: 'stdout' },
        file: { type: 'file', filename: 'log/app.log' }
    },
    categories: {
        default: { appenders: ['stdout'], level: 'debug' },
        prod: { appenders: ['stdout', 'file'], level: 'info' }
    }
});

export const logger = log4js.getLogger(process.env.PROD === 'true' ? 'prod' : 'default');

// env
dotenv.config({debug: true});

// koa server
const app = new Koa();

app.use(bodyParser());

const router = new Router({ prefix: '/node' });

router.get('/dota/news', getNews);
router.get('/login', login);
// Middleware below this line is only reached if JWT token is valid
router.use(jwt({ secret: process.env.JWT_SECRET }));
router.put('/admin/dota/news', setNews);

app.use(router.routes())
    .use(router.allowedMethods());

app.listen(3000);

// cron jobs
const dailyJob = new CronJob('3 58 2 * * *', function () {
    logger.info("corn job started!");
    crawlNews();
});
logger.debug(dailyJob.nextDates(10));
dailyJob.start();
