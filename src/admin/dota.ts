import { Context } from "koa";
import { DotaNewsNode } from "../types";
import { getDataResult } from "../utils";

export let news = [];
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