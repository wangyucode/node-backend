import { Context } from "koa";
import { DotaNews, DotaNewsNode } from "../types";
import { getDataResult } from "../utils";

export let leagues = [];
export let topNews : DotaNews = {
    href:'dev',
    img: 'https://wycode.cn/dota2static/dota2/b2dea7d0-e056-424f-a3e5-931e73a21e08.jpg',
    title: '更新通知',
    content: '添加中立物品支持，更新数据库至7.29',
    date: '2021-05-14'
};
export let news = [topNews];
export const newsDetail: Map<string, DotaNewsNode[]> = new Map();

export function setNews(ctx: Context) {
    news = [topNews].concat(ctx.request.body);
    ctx.body = getDataResult(news.length);
}

export function setTopNews(ctx: Context) {
    topNews = ctx.request.body;
    ctx.body = getDataResult(topNews);
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
    if (!ctx.request.body.length) ctx.throw(400, 'Invalid body length');
    console.log(leagues);
    leagues = ctx.request.body;
    ctx.body = getDataResult(leagues.length);
}
