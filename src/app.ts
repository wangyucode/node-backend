import * as Koa from 'koa';
import * as Router from '@koa/router';
// import {CronJob} from 'cron';

import {logger} from "./log";
import {getErrorResult} from "./utils";
import bodyParser = require("koa-bodyparser");
import { connectToDb } from './mongo';
import getRouter from './router';


// koa server
const app = new Koa();

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        // will only respond with JSON
        ctx.status = err.statusCode || err.status || 500;
        ctx.body = getErrorResult(err.message);
    }
});

app.use(bodyParser());

const router : Router = getRouter();

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
