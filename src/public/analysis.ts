import { Context } from "koa";

import { COLLECTIONS, db } from "../mongo";
import { Apps } from "../types";
import { getDataResult } from "../utils";

export async function getBlogs(ctx: Context) {
    const blogs = await db.collection(COLLECTIONS.ACCESS_COUNT).find(
        { _id: { $regex: /^blog_[\w-]+$/ } },
        {
            sort: { monthly: -1 },
            limit: 10
        }
    ).toArray();

    ctx.body = getDataResult(blogs);
}

export async function getApps(ctx: Context) {
    const apps = await db.collection(COLLECTIONS.ACCESS_COUNT).find({ _id: { $in: Apps } }).toArray();
    ctx.body = getDataResult(apps);
}

export async function getErrors(ctx: Context) {
    let page = Number.parseInt(ctx.query.page as string);
    const size = Number.parseInt(ctx.query.size as string);
    const status = Number.parseInt(ctx.query.status as string);
    if (Number.isNaN(size) || size <= 0) ctx.throw(400, 'size required');
    if (Number.isNaN(page) || page < 0) page = 0;
    const result = db.collection(COLLECTIONS.ACCESS_ERROR).find(
        status > 0 ? { status } : null,
        {
            projection: {_id: 0},
            sort: {
                time: -1,
            }
        }
    );
    const total = await result.count();
    const items = await result.skip(page * size).limit(size).toArray();
    ctx.body = getDataResult({ page, size, items, total });
}

export async function getRecords(ctx: Context) {
    const records = await db.collection(COLLECTIONS.ACCESS_COUNT).findOne({ _id: ctx.query.id || 'all' });
    ctx.body = getDataResult(records);
}
