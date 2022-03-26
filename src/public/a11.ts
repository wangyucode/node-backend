import { Context } from "koa";
import { getDataResult } from "../utils";
import * as wx from './wx';

export async function getWxSign(ctx: Context) {
    if (!ctx.query.url) ctx.throw(400, 'url required');
    const WxSign = await wx.getSign(process.env.WX_APPID_A11, process.env.WX_SECRET_A11, ctx.query.url as string);
    ctx.body = getDataResult(WxSign);
}