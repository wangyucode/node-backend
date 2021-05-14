import { Context } from "koa";
import { leagues, news, newsDetail, topNews } from "../admin/dota";
import { db } from "../mongo";
import { getDataResult, getErrorResult } from "../utils";

export function getNews(ctx: Context) {
    let page = Number.parseInt(ctx.query.page as string);
    let size = Number.parseInt(ctx.query.size as string);
    if (Number.isNaN(size) || size <= 0) ctx.throw(400, 'size required');
    if (Number.isNaN(page) || page < 0) page = 0;
    const items = ctx.query.version === 'dev' ? [topNews] : news.slice(page * size, page * size + size);
    const total = ctx.query.version === 'dev' ? 1 : news.length;
    ctx.body = getDataResult({ page, size, items, total });
}

export function getNewsDetail(ctx: Context) {
    if (!ctx.params.id) ctx.throw(400, 'id required');
    const detail = newsDetail.get(ctx.params.id);
    ctx.body = detail ? getDataResult(detail) : getErrorResult('detail not exist');
}

export function getLeagues(ctx: Context) {
    ctx.body = getDataResult(leagues);
}

export async function getItems(ctx: Context) {
    const itemsDb = db.collection('mongoDotaItem');
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
    const itemsDb = db.collection('mongoDotaItem');
    const result = await itemsDb.findOne({ _id: ctx.params.id }, {
        projection: {
            "_id": 0,
            "type": 0,
            "name": 0,
            "img": 0,
            "cost": 0,
            "cname": 0,
            "_class": 0
        }
    });
    ctx.body = getDataResult(result);
}

export async function getHeros(ctx: Context) {
    const itemsDb = db.collection('mongoDota2Hero');
    const result = await itemsDb.find().toArray();
    ctx.body = getDataResult(result);
}

export async function getHeroDetail(ctx: Context) {
    if (!ctx.params.id) ctx.throw(400, 'id required');
    const itemsDb = db.collection('mongoHeroDetail');
    const result = await itemsDb.findOne({ _id: ctx.params.id });
    ctx.body = getDataResult(result);
}