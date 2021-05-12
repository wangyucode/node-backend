import * as Koa from 'koa';
import * as jwt from 'koa-jwt';
// import {CronJob} from 'cron';
import * as Router from '@koa/router';
import {login} from './auth';
import {clearNews, setNews, setNewsDetail} from './admin/dota';
import {getNews, getNewsDetail} from './public/dota';
import {logger} from "./log";
import {getErrorResult} from "./utils";
import bodyParser = require("koa-bodyparser");
import { connectToDb } from './mongo';
import { getConfig } from './public/common';
import { deleteConfig, setConfig } from './admin/common';

// koa server
const app = new Koa();

app.use(async (ctx, next) => {
    try {
        logger.info(ctx.header.authorization);
        await next();
    } catch (err) {
        // will only respond with JSON
        ctx.status = err.statusCode || err.status || 500;
        ctx.body = getErrorResult(err.message);
    }
});

app.use(bodyParser());

const router = new Router({prefix: '/node'});

router.get('/config', getConfig);
router.get('/dota/news', getNews);
router.get('/dota/news/:id', getNewsDetail);
router.get('/login', login);
// Middleware below this line is only reached if JWT token is valid
router.use(jwt({secret: process.env.JWT_SECRET}));
router.put('/admin/config', setConfig);
router.delete('/admin/config', deleteConfig);
router.put('/admin/dota/news', setNews);
router.put('/admin/dota/news/:id', setNewsDetail);
router.delete('/admin/dota/news', clearNews);

app.use(router.routes())
    .use(router.allowedMethods());


app.listen(8082);

connectToDb();

logger.info('server listening on 8082')

// cron jobs
// const dailyJob = new CronJob('3 58 2 * * *', function () {
//     logger.info("corn job started!");
//     crawlNews();
// });
// logger.debug(dailyJob.nextDates(10));
// dailyJob.start();
