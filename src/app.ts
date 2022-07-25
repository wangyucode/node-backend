import Application from 'koa';
import cors from '@koa/cors';
import Router from '@koa/router';

import { logger } from "./log";
import { getErrorResult } from "./utils";
import bodyParser = require("koa-bodyparser");
import { connectToDb } from './mongo';
import getRouter from './router';
import setupCron from './cron';
import applyPatch from './patch';

// koa server
const app = new Application();
const router: Router = getRouter();

app.use(cors())
    .use(async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            // will only respond with JSON
            ctx.status = err.status || 500;
            ctx.body = getErrorResult(err.message || JSON.stringify(err));
        }
    })
    .use(bodyParser())
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(8082);

logger.info('server listening on 8082');

connectToDb()
    .then(setupCron)
    .then(applyPatch);
