import * as Koa from 'koa';
import * as jwt from 'koa-jwt';
import * as Router from '@koa/router';
import * as bodyParser from 'koa-bodyparser';
import {login} from './auth';
import {setNews} from './admin/dota';
import {getNews} from './public/dota';
import {JWT_SECRET} from "./const";

const app = new Koa();

app.use(bodyParser());

const router = new Router({prefix: '/node'});

router.get('/dota/news', getNews);
router.get('/login', login);
// Middleware below this line is only reached if JWT token is valid
router.use(jwt({secret: JWT_SECRET}));
router.put('/admin/dota/news', setNews);

app.use(router.routes())
    .use(router.allowedMethods());

app.listen(3000);
