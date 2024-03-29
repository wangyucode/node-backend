import Router from '@koa/router';
import jwt from 'koa-jwt';

import * as common from './public/common';
import * as admin_common from './admin/common';
import * as auth from './auth';
import * as admin_dota from './admin/dota';
import * as dota from './public/dota';
import * as clipboard from './public/clipboard';
// import * as a11 from './public/a11'
import * as analysis from './public/analysis'

export default function getRouter(): Router {
    const router = new Router({ prefix: '/node' });

    router.get('/config', common.getConfig);
    router.post('/comments', common.postComment);
    router.get('/comments', common.getComments);
    router.post('/mail', common.sendNotification);
    router.get('/appStatus', common.getAppStatus);
    router.get('/apps', common.getWechatApps);

    router.get('/dota/news', dota.checkReferer, dota.getNews);
    router.get('/dota/news/:id', dota.checkReferer, dota.getNewsDetail);
    router.get('/dota/leagues', dota.checkReferer, dota.getLeagues);
    router.get('/dota/schedules', dota.checkReferer, dota.getSchedules);
    router.get('/dota/teams', dota.checkReferer, dota.getTeams);
    router.get('/dota/items', dota.checkReferer, dota.getItems);
    router.get('/dota/items/:id', dota.checkReferer, dota.getItemDetail);
    router.get('/dota/heroes', dota.checkReferer, dota.getHeros);
    router.get('/dota/heroes/:id', dota.checkReferer, dota.getHeroDetail);
    router.get('/dota/leaderboard', dota.checkReferer, dota.getLeaderboard);

    router.get('/clipboard/wx/session', clipboard.getWxSession);
    router.get('/clipboard/notification', clipboard.getNotification);
    router.get('/clipboard/:id', clipboard.getById);
    router.get('/clipboard/openid/:openid', clipboard.getByOpenid);
    router.post('/clipboard', clipboard.saveById);

    router.get('/analysis/blogs', analysis.getBlogs);
    router.get('/analysis/apps', analysis.getApps);
    router.get('/analysis/records', analysis.getRecords);
    router.get('/analysis/errors', analysis.getErrors);

    // router.get('/a11/sign', a11.getWxSign);

    router.get('/login', auth.login);

    // Middleware below this line is only reached if JWT token is valid
    router.use(jwt({ secret: process.env.JWT_SECRET }));

    router.put('/admin/config', admin_common.setConfig);
    router.delete('/admin/config', admin_common.deleteConfig);

    router.post('/admin/dota/news', admin_dota.postNews);
    router.put('/admin/dota/schedules', admin_dota.putSchedules);
    router.put('/admin/dota/leagues', admin_dota.putLeagues);
    router.put('/admin/dota/teams', admin_dota.putTeams);

    router.post('/admin/dota/hero', admin_dota.postHero);
    router.post('/admin/dota/item', admin_dota.postItem);

    return router;
}