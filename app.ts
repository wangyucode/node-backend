import * as Koa from 'koa';
import * as jwt from 'koa-jwt';
import * as Router from 'koa-router';
import { login } from './admin/auth';
import { setNews } from './admin/dota';
import { getNews } from './public/dota';

const app = new Koa();

const router = new Router({ prefix: '/node' });

router.get('/dota/news', getNews);
router.get('/login', login);


router.post('/admin/dota/news', setNews);

console.log(typeof(jwt({ secret: '123456' })));
router.use("/node/admin",jwt({ secret: '123456' }));



app.use(router.routes());

app.listen(3000);