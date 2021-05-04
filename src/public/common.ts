import {Context} from "koa";
import { db } from "../mongo";
import { getDataResult } from "../utils";

export async function getConfig(ctx: Context) {
    if (!ctx.query.k) ctx.throw(400, 'k required');
    const configs = db.collection('wyConfig');
    const result = await configs.findOne({_id: ctx.query.k})
    ctx.body = getDataResult(result);
}
