import { Context } from "koa";
import { logger } from "../log";
import { COLLECTIONS, CONFIG_KEYS, db } from "../mongo";
import { getDataResult } from "../utils";
import { setConfig } from "./common";


export async function putSchedules(ctx: Context) {
    if (!ctx.request.body.length) ctx.throw(400, 'Invalid body length');
    ctx.query.k = CONFIG_KEYS.CONFIG_DOTA_SCHEDULES;
    ctx.query.v = ctx.request.body;
    await setConfig(ctx);
}

export async function postNews(ctx: Context) {
    if (!ctx.request.body._id) ctx.throw(400, '_id required');
    const nc = db.collection(COLLECTIONS.DOTA_NEWS);
    const news = ctx.request.body;
    let result = { insertedCount: 0 }
    try {
        result = await nc.insertOne(news)
    } catch (e) {
        logger.info(`${news._id} exist`)
    };
    ctx.body = getDataResult(result.insertedCount);
}

export async function putLeagues(ctx: Context) {
    if (!ctx.request.body.length) ctx.throw(400, 'Invalid body length');
    ctx.query.k = CONFIG_KEYS.CONFIG_DOTA_LEAGUES;
    ctx.query.v = ctx.request.body;
    await setConfig(ctx);
}

export async function postHero(ctx: Context) {
    if (!ctx.request.body.name) ctx.throw(400, 'Invalid name');
    const heros = db.collection(COLLECTIONS.DOTA_HERO_DETAIL);
    const hero = ctx.request.body;
    const result = await heros.updateOne({ _id: hero.name }, {
        $set: hero,
        $unset: { _class: "" }
    }, {
        upsert: true
    });
    ctx.body = getDataResult(result.result);
}

export async function postItem(ctx: Context) {
    if (!ctx.request.body.key) ctx.throw(400, 'Invalid key');
    const items = db.collection(COLLECTIONS.DOTA_ITEM);
    const item = ctx.request.body;
    const result = await items.updateOne({ _id: item.key }, {
        $set: item,
        $unset: { _class: "" }
    }, {
        upsert: true
    });
    ctx.body = getDataResult(result.result);
}
