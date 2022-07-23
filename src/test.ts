import { subDays, subHours } from "date-fns";
import { Context } from "koa";
import { COLLECTIONS, connectToDb, db } from "./mongo";
import { getAll, getApps, getBlogs, getErrors } from "./public/analysis";
import { Apps } from "./types";

const ctx = {} as Context;

async function test() {
    await connectToDb();
    await getErrors(ctx);
    console.log('result->', ctx.body);
}

test();

