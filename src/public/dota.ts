import { Context } from "koa";
import { COLLECTIONS, CONFIG_KEYS, db } from "../mongo";
import { getDataResult, getErrorResult } from "../utils";

export async function getLeaderboard(ctx: Context) {
    let page = Number.parseInt(ctx.query.page as string);
    let size = Number.parseInt(ctx.query.size as string);
    if (Number.isNaN(size) || size <= 0) ctx.throw(400, 'size required');
    if (Number.isNaN(page) || page < 0) page = 0;
    const configs = db.collection(COLLECTIONS.CONFIG);
    const config = await configs.findOne(
        { _id: CONFIG_KEYS.CONFIG_DOTA_LEADERBOARD },
        {
            projection: {
                value: { $slice: [page * size, size] },
                total: { $size: '$value' }
            }
        }
    );

    ctx.body = getDataResult({ page, size, items: config.value, total: config.total });
}

export async function getNews(ctx: Context) {
    let page = Number.parseInt(ctx.query.page as string);
    let size = Number.parseInt(ctx.query.size as string);
    if (Number.isNaN(size) || size <= 0) ctx.throw(400, 'size required');
    if (Number.isNaN(page) || page < 0) page = 0;
    const nc = db.collection(COLLECTIONS.DOTA_NEWS);
    const result = nc.find(null, {
        projection: {
            href: '$_id',
            _id: 0,
            img: 1,
            title: 1,
            content: 1,
            date: 1
        },
        sort: {
            date: -1,
        }
    });
    const total = await result.count();
    const items = await result.skip(page * size).limit(size).toArray();
    ctx.body = getDataResult({ page, size, items, total });
}

export async function getNewsDetail(ctx: Context) {
    if (!ctx.params.id) ctx.throw(400, 'id required');
    const nc = db.collection(COLLECTIONS.DOTA_NEWS);
    const result = await nc.findOne({ _id: ctx.params.id }, { projection: { details: 1, _id: 0 } });
    ctx.body = result ? getDataResult(result.details) : getErrorResult('detail not exist');
}

export async function getSchedules(ctx: Context) {
    const configs = db.collection(COLLECTIONS.CONFIG);
    const config = await configs.findOne({ _id: CONFIG_KEYS.CONFIG_DOTA_SCHEDULES });
    ctx.body = getDataResult(config.value);
}

export async function getTeams(ctx: Context) {
    const configs = db.collection(COLLECTIONS.CONFIG);
    const config = await configs.findOne({ _id: CONFIG_KEYS.CONFIG_DOTA_TEAMS });
    ctx.body = getDataResult(config.value);
}

export async function getLeagues(ctx: Context) {
    const configs = db.collection(COLLECTIONS.CONFIG);
    const config = await configs.findOne({ _id: CONFIG_KEYS.CONFIG_DOTA_LEAGUES });
    ctx.body = getDataResult(config.value);
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
            "_id": 0
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
            a.attributes['????????????'] = a.shard;
        }
        if (a.scepter) {
            a.attributes['????????????'] = a.scepter;
        }
        if (a.behavior) {
            a.attributes['????????????'] = a.behavior;
        }
        if (a.dispellable) {
            a.attributes['????????????'] = a.dispellable;
        }
        if (a.immunity) {
            a.attributes['????????????'] = a.immunity;
        }
        if (a.effect) {
            a.attributes['?????????'] = a.effect;
        }
        if (a.damage) {
            a.attributes['????????????'] = a.damage;
        }
    }
    ctx.body = getDataResult(result);
}
