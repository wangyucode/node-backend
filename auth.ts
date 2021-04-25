import {Context} from "koa";
import {sign} from "jsonwebtoken";


export function login(ctx: Context) {
    ctx.body = sign({id: 0, name: "wayne", img: "icon.png"}, ctx.state.jwtSecret, {expiresIn: "1h"});
}
