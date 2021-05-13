import { Context } from "koa";
import { DotaNewsNode } from "../types";
import { getDataResult } from "../utils";

export let news = [];
export let leagues = [];
export const newsDetail: Map<string, DotaNewsNode[]> = new Map();

export function setNews(ctx: Context) {
    news = ctx.request.body;
    ctx.body = getDataResult(news.length);
}

export function setNewsDetail(ctx: Context) {
    newsDetail.set(ctx.params.id, ctx.request.body);
    ctx.body = getDataResult({ id: ctx.params.id, size: ctx.request.body.length });
}

export function clearNews(ctx: Context) {
    newsDetail.clear();
    ctx.body = getDataResult(0);
}

export function putLeagues(ctx: Context) {
    if(!ctx.request.body.length) ctx.throw(400, 'Invalid body length');
    console.log(leagues);
    leagues = ctx.request.body;
    ctx.body = getDataResult(leagues.length);
}
