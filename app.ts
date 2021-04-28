import * as Koa from 'koa';
import * as jwt from 'koa-jwt';
import * as Router from '@koa/router';
import {login} from './auth';
import {setNews} from './admin/dota';
import {getNews} from './public/dota';
import {CronJob} from 'cron';
import * as dotenv from 'dotenv';
import {crawlNews} from './crawler/news';
import bodyParser = require("koa-bodyparser");
import {logger} from "./log";


// env
dotenv.config({debug: true});

// koa server
const app = new Koa();

app.use(bodyParser());

const router = new Router({prefix: '/node'});

router.get('/dota/news', getNews);
router.get('/login', login);
// Middleware below this line is only reached if JWT token is valid
router.use(jwt({secret: process.env.JWT_SECRET}));
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
