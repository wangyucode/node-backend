import { Context } from "koa";
import {APP_STATE} from "../const";


export function getNews(ctx: Context) {
    ctx.body = APP_STATE.dotaNews;
}
