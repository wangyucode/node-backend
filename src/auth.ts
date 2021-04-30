import { Context } from "koa";
import { sign } from "jsonwebtoken";
import { getDataResult } from "./utils";

export function login(ctx: Context) {
    if (!ctx.request.query.u) ctx.throw(400, 'u required');
    if (!ctx.request.query.p) ctx.throw(400, 'p required');
    if (ctx.request.query.p !== process.env.WYCODE_ADMIN_PASSWORD) ctx.throw(401, 'invalid username or password');
    const token = sign({ id: 0, name: "wayne", img: "icon.png" }, process.env.JWT_SECRET, { expiresIn: "1h" })
    ctx.body = getDataResult(token);
}
