import {Context} from "koa";
import {news} from "../crawler/news";

export function getNews(ctx: Context) {
    ctx.body = news;
}
