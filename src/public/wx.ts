import axios from "axios";
import sha1 from 'sha1';

import { ExternalError } from "../types";
import { randomString, requestByProxy } from "../utils";

const SESSION_URL = 'https://api.weixin.qq.com/sns/jscode2session';
const TOKEN_URL = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential';
const TICKET_URL = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket'

interface Session {
    session_key?: string;
    openid?: string;
}

interface WxSign {
    appId: string;
    nonceStr: string;
    timestamp: number;
    signature: string;
}

let cachedTime = 0;
let cachedSign: WxSign = null;

export async function getSession(appid: string, secret: string, jscode: string): Promise<Session> {
    const url = `${SESSION_URL}?appid=${appid}&secret=${secret}&js_code=${jscode}&grant_type=authorization_code`;
    const res = await axios.get(url);
    return res.data;
}

export async function getSign(appid: string, secret: string, url: string): Promise<WxSign> {
    const timestamp = new Date().getTime() / 1000 | 0;
    if (cachedTime + 7200 < timestamp) {
        const res = await requestByProxy(`${TOKEN_URL}&appid=${appid}&secret=${secret}`);
        if (res.data && res.data.access_token) {
            const resTicket = await axios.get(`${TICKET_URL}?access_token=${res.data.access_token}&type=jsapi`);
            if (resTicket.data.ticket) {
                const nonceStr = randomString();
                const src = `jsapi_ticket=${resTicket.data.ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
                const signature = sha1(src);
                cachedSign = { appId: appid, nonceStr, signature, timestamp };
                cachedTime = timestamp;
                return cachedSign;
            } else {
                throw new ExternalError(400, resTicket.data);
            }
        } else {
            throw new ExternalError(400, res.data);
        }
    } else {
        return cachedSign;
    }
}


