import { subDays, subHours } from "date-fns";
import { Context } from "koa";
import { logger } from "./log";
import { COLLECTIONS, connectToDb, db } from "./mongo";
import applyPatch from "./patch";
import { getAll, getApps, getBlogs, getErrors } from "./public/analysis";
import { Apps } from "./types";

const ctx = {} as Context;

async function test() {
    await connectToDb();
    await applyPatch();
}

test();

