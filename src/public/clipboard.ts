import { Context } from "koa";
import { v4 as uuidv4 } from 'uuid';
import { COLLECTIONS, CONFIG_KEYS, db } from "../mongo";
import { getDataResult, getErrorResult} from "../utils";
import { getConfig } from "./common";
import * as wx from './wx';

export async function getNotification(ctx: Context) {
    ctx.query.k = CONFIG_KEYS.CONFIG_NOTIFICATION_CLIPBOARD;
    return await getConfig(ctx);
}

export async function getById(ctx: Context) {
    if (!ctx.params.id) ctx.throw(400, 'id required');
    const cc = db.collection(COLLECTIONS.CLIPBOARD);
    const result = await cc.findOne({ _id: ctx.params.id }, { projection: { content: 1, createDate: 1, lastUpdate: 1, tips: 1 } });
    ctx.body = result ? getDataResult(result) : getErrorResult('not exist');
}

export async function getByOpenid(ctx: Context) {
    if (!ctx.params.openid) ctx.throw(400, 'key required');
    const result = await findByOpenid(ctx.params.openid);
    ctx.body = result ? getDataResult(result) : getErrorResult('not exist');
}

export async function saveById(ctx: Context) {
    const data = ctx.request.body;
    if (!data._id) ctx.throw(400, '_id required');
    const cc = db.collection(COLLECTIONS.CLIPBOARD);
    const result = await cc.updateOne(
        { _id: data._id },
        {
            $set: { content: data.content, lastUpdate: new Date() }
        });
    ctx.body = result.matchedCount ? getDataResult(data._id) : getErrorResult('not exist');
}


export async function getWxSession(ctx: Context) {
    if (!ctx.query.code) ctx.throw(400, 'code required');
    const wxsession = await wx.getSession(process.env.WX_APPID_CLIPBOARD, process.env.WX_SECRET_CLIPBOARD, ctx.query.code as string);
    if (wxsession.openid) {
        let result = await findByOpenid(wxsession.openid);
        if (result) {
            ctx.body = getDataResult(result);
        } else {
            let id = generateShortUuid();
            const cc = db.collection(COLLECTIONS.CLIPBOARD);
            while (await cc.findOne({ _id: id })) { //add new char if id exist
                id += Math.floor(Math.random() * 36).toString(36);
            }
            const now = new Date();
            result = {
                _id: id,
                content: '请输入你想保存的内容，内容可在网页端：https://wycode.cn/clipboard.html 使用查询码查询，或小程序免登录查询。',
                tips: '',
                openid: wxsession.openid,
                createDate: now,
                lastUpdate: now
            }
            await cc.insertOne(result);
            ctx.body = getDataResult(result);
        }
    } else {
        ctx.body = getErrorResult('登录失败');
    }
}

async function findByOpenid(openid: string) {
    const cc = db.collection(COLLECTIONS.CLIPBOARD);
    return await cc.findOne({ openid: openid }, { projection: { content: 1, createDate: 1, lastUpdate: 1, tips: 1, openid: 1 } });
}


function generateShortUuid(): string {
    const uuid = uuidv4().replace("-", "");
    let shortId = '';
    for (let i = 0; i < 4; i++) { //分成4组，每组8位
        const str = uuid.substring(i * 8, i * 8 + 8);
        const x = Number.parseInt(str, 16);
        shortId += (x % 36).toString(36); //对10个数字和26个字母取模
    }
    return shortId;
}