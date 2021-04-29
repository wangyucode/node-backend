import { Context } from "koa";
import { news, newsDetail } from "../crawler/news";

export function getNews(ctx: Context) {
    let page = Number.parseInt(ctx.query.page as string);
    let size = Number.parseInt(ctx.query.size as string);
    if (Number.isNaN(size) || size <= 0) ctx.throw(400, 'size required');
    if (Number.isNaN(page) || page < 0) page = 0;

    ctx.body = news.slice(page * size, page * size + size);
}

export function getNewsDetail(ctx: Context) {
    if (ctx.params.id) ctx.throw(400, 'id required');

    ctx.body = newsDetail.get(ctx.params.id);
}
