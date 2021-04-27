import { Context } from "koa";
import {APP_STATE} from "../const";


export function setNews(ctx: Context) {
    console.log(ctx.request.body);
    if(ctx.request.body.length){
        APP_STATE.dotaNews = ctx.request.body
    }
    ctx.status = 200;
}
