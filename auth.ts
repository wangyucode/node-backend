import {Context} from "koa";
import {sign} from "jsonwebtoken";
import {JWT_SECRET} from "./const";

export function login(ctx: Context) {
    console.log(ctx.request.query);
    ctx.body = sign({id: 0, name: "wayne", img: "icon.png"}, JWT_SECRET, {expiresIn: "1h"});
}
