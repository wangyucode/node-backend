import * as Router from '@koa/router';
import * as jwt from 'koa-jwt';

import * as common from './public/common';
import * as admin_common from './admin/common';
import * as auth from './auth';
import * as admin_dota from './admin/dota';
import * as dota from './public/dota';

export default function getRouter(): Router {
    const router = new Router({ prefix: '/node' });

    router.get('/config', common.getConfig);

    router.get('/dota/news', dota.getNews);
    router.get('/dota/news/:id', dota.getNewsDetail);

    router.get('/dota/leagues', dota.getLeagues);

    router.get('/dota/items', dota.getItems);
    router.get('/dota/items/:id', dota.getItemDetail);

    router.get('/dota/heros', dota.getHeros);
    router.get('/dota/heros/:id', dota.getHeroDetail);

    router.get('/login', auth.login);

    // Middleware below this line is only reached if JWT token is valid
    router.use(jwt({ secret: process.env.JWT_SECRET }));

    router.put('/admin/config', admin_common.setConfig);
    router.delete('/admin/config', admin_common.deleteConfig);

    router.put('/admin/dota/news', admin_dota.setNews);
    router.put('/admin/dota/news/:id', admin_dota.setNewsDetail);
    router.delete('/admin/dota/news', admin_dota.clearNews);
    router.put('/admin/dota/top', admin_dota.setTopNews);

    router.put('/admin/dota/leagues', admin_dota.putLeagues);

    return router;
}