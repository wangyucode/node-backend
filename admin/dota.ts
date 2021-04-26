import { Context } from "koa";
import { dota_news } from "../const";


export function setNews(ctx: Context) {
    console.log(ctx.request.body);
}
