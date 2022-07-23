import { Context } from "koa";

import { COLLECTIONS, db } from "../mongo";
import { Apps } from "../types";
import { getDataResult } from "../utils";

export async function getBlogs(ctx: Context) {
    const blogs = await db.collection(COLLECTIONS.ACCESS_COUNT).find(
        { _id: { $regex: /^\d{4}-\d{2}-\d{2}-.+\.html$/ } },
        {
            sort: { total: -1 },
            limit: 10
        }
    ).toArray();

    ctx.body = getDataResult(blogs);
}

export async function getApps(ctx: Context) {
    const apps = await db.collection(COLLECTIONS.ACCESS_COUNT).find({ _id: { $in: Apps } }).toArray();
    ctx.body = getDataResult(apps);
}

export async function getAll(ctx: Context) {
    const all = await db.collection(COLLECTIONS.ACCESS_COUNT).findOne({ _id: 'all' })
    ctx.body = getDataResult(all);
}

export async function getErrors(ctx: Context) {
    const errors = await db.collection(COLLECTIONS.ACCESS_ERROR).find().toArray();
    ctx.body = getDataResult(errors);
}