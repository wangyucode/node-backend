import { Context, Middleware } from "koa";


export function login(ctx: Context, next: Middleware) {
    
    ctx.body = "login";
}