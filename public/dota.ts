import { Context } from "koa";


export function getNews(ctx: Context) {
    ctx.body = "news";
}