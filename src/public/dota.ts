import { Context } from "koa";
import { leagues, news, newsDetail, schedules, topNews } from "../admin/dota";
import { COLLECTIONS, db } from "../mongo";
import { getDataResult, getErrorResult } from "../utils";
import { leaderboard, teams } from '../cron';


export async function getLeaderboard(ctx: Context) {
    let page = Number.parseInt(ctx.query.page as string);
    let size = Number.parseInt(ctx.query.size as string);
    if (Number.isNaN(size) || size <= 0) ctx.throw(400, 'size required');
    if (Number.isNaN(page) || page < 0) page = 0;
    const items = leaderboard.slice(page * size, page * size + size);
    const total = leaderboard.length;
    ctx.body = getDataResult({ page, size, items, total });
}

export async function getNews(ctx: Context) {
    let page = Number.parseInt(ctx.query.page as string);
    let size = Number.parseInt(ctx.query.size as string);
    if (Number.isNaN(size) || size <= 0) ctx.throw(400, 'size required');
    if (Number.isNaN(page) || page < 0) page = 0;
    const configs = db.collection(COLLECTIONS.CONFIG);
    const version = await configs.findOne({ _id: 'CONFIG_DOTA_VERSION' });
    const items = version.value === 'dev' ? [topNews] : news.slice(page * size, page * size + size);
    const total = version.value === 'dev' ? 1 : news.length;
    ctx.body = getDataResult({ page, size, items, total });
}

export function getNewsDetail(ctx: Context) {
    if (!ctx.params.id) ctx.throw(400, 'id required');
    const detail = newsDetail.get(ctx.params.id);
    ctx.body = detail ? getDataResult(detail) : getErrorResult('detail not exist');
}

export function getSchedules(ctx: Context) {
    ctx.body = getDataResult(schedules);
}

export function getTeams(ctx: Context) {
    ctx.body = getDataResult(teams);
}

export function getLeagues(ctx: Context) {
    ctx.body = getDataResult(leagues);
}


export async function getItems(ctx: Context) {
    const itemsDb = db.collection(COLLECTIONS.DOTA_ITEM);
    const result = await itemsDb.find(null, {
        projection: {
            "type": 1,
            "name": 1,
            "img": 1,
            "cost": 1,
            "cname": 1
        }
    }).toArray();
    ctx.body = getDataResult(result);
}

export async function getItemDetail(ctx: Context) {
    if (!ctx.params.id) ctx.throw(400, 'id required');
    const itemsDb = db.collection(COLLECTIONS.DOTA_ITEM);
    const result = await itemsDb.findOne({ _id: ctx.params.id }, {
        projection: {
            "_id": 0,
            "_class": 0
        }
    });
    ctx.body = getDataResult(result);
}

export async function getHeros(ctx: Context) {
    const itemsDb = db.collection(COLLECTIONS.DOTA_HERO_DETAIL);
    const result = await itemsDb.find(null, {
        projection: {
            "icon": 1,
            "type": 1,
            "imageUrl": "$img",
        }
    }).toArray();
    ctx.body = getDataResult(result);
}

export async function getHeroDetail(ctx: Context) {
    if (!ctx.params.id) ctx.throw(400, 'id required');
    const itemsDb = db.collection(COLLECTIONS.DOTA_HERO_DETAIL);
    const result = await itemsDb.findOne({ _id: decodeURIComponent(ctx.params.id) });
    for (const a of result.abilities) {
        if (a.shard) {
            a.attributes['魔晶升级：'] = a.shard;
        }
        if(a.scepter) {
            a.attributes['神杖升级：'] = a.scepter;
        }
        if(a.behavior) {
            a.attributes['技能目标：'] = a.behavior;
        }
        if(a.dispellable) {
            a.attributes['能否驱散：'] = a.dispellable;
        }
        if(a.immunity) {
            a.attributes['无视魔免：'] = a.immunity;
        }
        if(a.effect) {
            a.attributes['作用于：'] = a.effect;
        }
        if(a.damage) {
            a.attributes['伤害类型：'] = a.damage;
        }
    }
    ctx.body = getDataResult(result);
}
