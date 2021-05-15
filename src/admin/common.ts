import { Context } from "koa";
import { COLLECTIONS, db } from "../mongo";
import { getDataResult } from "../utils";

export async function setConfig(ctx: Context) {
    if (!ctx.query.k) ctx.throw(400, 'k required');
    if (!ctx.query.v) ctx.throw(400, 'v required');
    const configs = db.collection(COLLECTIONS.CONFIG);
    await configs.updateOne({ _id: ctx.query.k },
        { $set: { _id: ctx.query.k, value: ctx.query.v, date: new Date() } },
        { upsert: true });
    ctx.body = getDataResult(ctx.query.k);
}

export async function deleteConfig(ctx: Context) {
    if (!ctx.query.k) ctx.throw(400, 'k required');
    const configs = db.collection(COLLECTIONS.CONFIG);
    await configs.deleteOne({ _id: ctx.query.k });
    ctx.body = getDataResult(ctx.query.k);
}
