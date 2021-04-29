import { Context } from "koa";


export function setNews(ctx: Context) {
    console.log(ctx.request.body);
    ctx.status = 200;
}
