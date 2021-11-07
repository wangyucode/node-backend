import { Context } from "koa";
import * as fetch from 'node-fetch';

const SESSION_URL = 'https://api.weixin.qq.com/sns/jscode2session';

interface Session {
    session_key?: string;
    openid?: string;
}

export async function getSession(appid: string, secret: string, jscode: string): Promise<Session> {
    const url = `${SESSION_URL}?appid=${appid}&secret=${secret}&js_code=${jscode}&grant_type=authorization_code`;
    const res = await fetch(url);
    return await res.json();
}
