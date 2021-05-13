import * as Router from '@koa/router';
import * as jwt from 'koa-jwt';

import { getConfig } from './public/common';
import { deleteConfig, setConfig } from './admin/common';
import { login } from './auth';
import { clearNews, putLeagues, setNews, setNewsDetail } from './admin/dota';
import { getLeagues, getNews, getNewsDetail } from './public/dota';

export default function getRouter(): Router {
    const router = new Router({ prefix: '/node' });

    router.get('/config', getConfig);

    router.get('/dota/news', getNews);
    router.get('/dota/news/:id', getNewsDetail);

    router.get('/dota/leagues', getLeagues);

    router.get('/login', login);

    // Middleware below this line is only reached if JWT token is valid
    router.use(jwt({ secret: process.env.JWT_SECRET }));

    router.put('/admin/config', setConfig);
    router.delete('/admin/config', deleteConfig);

    router.put('/admin/dota/news', setNews);
    router.put('/admin/dota/news/:id', setNewsDetail);
    router.delete('/admin/dota/news', clearNews);

    router.put('/admin/dota/leagues', putLeagues);

    return router;
}