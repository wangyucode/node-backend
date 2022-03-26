import Application from 'koa';
import cors from '@koa/cors';
import Router from '@koa/router';

import {logger} from "./log";
import {getErrorResult} from "./utils";
import bodyParser = require("koa-bodyparser");
import { connectToDb } from './mongo';
import getRouter from './router';
import setupCron from './cron';

// koa server
const app = new Application();
app.use(cors());

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        // will only respond with JSON
        ctx.status = err.status || 500;
        ctx.body = getErrorResult(err.message || JSON.stringify(err));
    }
});

app.use(bodyParser());

const router : Router = getRouter();

app.use(router.routes())
    .use(router.allowedMethods());

app.listen(8082);

connectToDb();

logger.info('server listening on 8082')

//cron jobs
setupCron();
