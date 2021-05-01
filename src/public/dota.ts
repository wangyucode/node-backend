import {Context} from "koa";
import { news, newsDetail } from "../admin/dota";
import {Page} from "../types";
import {getDataResult, getErrorResult} from "../utils";

export function getNews(ctx: Context) {
    let page = Number.parseInt(ctx.query.page as string);
    let size = Number.parseInt(ctx.query.size as string);
    if (Number.isNaN(size) || size <= 0) ctx.throw(400, 'size required');
    if (Number.isNaN(page) || page < 0) page = 0;
    const pageResult: Page = {page, size, items: news.slice(page * size, page * size + size), total: news.length};
    ctx.body = getDataResult(pageResult);
}

export function getNewsDetail(ctx: Context) {
    if (!ctx.params.id) ctx.throw(400, 'id required');
    const detail = newsDetail.get(ctx.params.id);
    ctx.body = detail ? getDataResult(detail) : getErrorResult('detail not exist');
}
