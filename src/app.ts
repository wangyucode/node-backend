import Application from 'koa';
import cors from '@koa/cors';
import Router from '@koa/router';
import bodyParser from "koa-bodyparser";

import { logger } from "./log";
import { getErrorResult, isProd } from "./utils";
import { connectToDb } from './mongo';
import getRouter from './router';
import setupCron from './cron';
import applyPatch from './patch';
import { email, ADMIN_EMAIL } from './mail';

function startHttpServer() {
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
}

connectToDb()
    .then(applyPatch)
    .then(startHttpServer)
    .then(setupCron)
    .then(() => {
        logger.info('server listening on 8082');
        isProd() && email(ADMIN_EMAIL, 'node-backend 已启动', `node-backend 启动于: ${new Date().toString()}.`);
    })
    .catch((err) => {
        logger.error('node-backend 启动时发生错误', err);
        isProd() && email(ADMIN_EMAIL, 'node-backend 启动失败', JSON.stringify(err));
    });
