import { get, isEmpty } from "lodash";
import { ObjectId } from "bson";
import { Context } from "koa";
import { logger } from "../log";
import { ADMIN_EMAIL, email } from "../mail";
import { COLLECTIONS, CONFIG_KEYS, db } from "../mongo";
import { getDataResult, getErrorResult, isProd } from "../utils";

export async function getConfig(ctx: Context) {
    if (!ctx.query.k) ctx.throw(400, 'k required');
    const configs = db.collection(COLLECTIONS.CONFIG);
    const result = await configs.findOne({ _id: ctx.query.k });
    ctx.body = result ? getDataResult(result) : getErrorResult('not exsit');
}

export async function getComments(ctx: Context) {
    if (!ctx.query.k) ctx.throw(400, 'k required');
    if (!ctx.query.a) ctx.throw(400, 'a required');
    if (!ctx.query.t) ctx.throw(400, 't required');

    const app = await getCommentApp(ctx.query.a as string, ctx.query.k as string);
    if (!app) ctx.throw(401, '没有权限');

    const comments = db.collection(COLLECTIONS.COMMENT);
    const result = await comments.find({ app: ctx.query.a, topic: ctx.query.t },
        {
            projection: {
                createTime: { $dateToString: { date: '$createTime', format: '%Y/%m/%d %H:%M:%S', timezone: '+08' } },
                content: 1,
                user: 1,
                like: 1,
                to: 1
            }
        }
    ).toArray();
    // hide user email
    result.map(it => {
        if (/^\S+@\w+(\.[\w]+)+$/.test(it.user)) {
            let user = it.user.charAt(0);
            const atIndex = it.user.lastIndexOf('@');
            user += new Array(atIndex).fill('*').join('');
            user += it.user.substring(atIndex);
            it.user = user;
        }
    });
    ctx.body = getDataResult(result);
}

export async function postComment(ctx: Context) {
    const comment = ctx.request.body;
    logger.info('postComment-->', comment);

    if (!comment) ctx.throw(400, '格式错误');
    // 评论类型，0.文字评论，1.点赞，2.图片评论
    if ((typeof comment.type) !== "number" || comment.type < 0 || comment.type > 2) ctx.throw(400, '评论类型不合法');
    if (comment.type === 0 || comment.type === 2) {
        if (!comment.content || !comment.content.length) ctx.throw(400, '内容不能为空');
        if (comment.content.length > 1023) ctx.throw(400, '内容不能超过1000个字');
    }
    // 垃圾信息过滤 TODO
    if (/^[0-9_a-z_A-Z]{8}$/.test(comment.content)) {
        logger.warn('评论已屏蔽');
        ctx.throw(400, '请勿发表无意义的内容');
    }

    const app = await getCommentApp(comment.app, comment.key);
    if (!app) ctx.throw(401, '没有权限');

    const commentCollection = db.collection(COLLECTIONS.COMMENT);
    let result = null;
    switch (comment.type) {
        case 0:
            const data = {
                app: comment.app,
                topic: comment.topic,
                content: comment.content,
                type: comment.type,
                user: comment.user || comment.fromUserName, //TODO
                to: comment.to,
                deleted: false,
                createTime: new Date(),
                like: 0
            };
            result = await commentCollection.insertOne(data);
            isProd() && email(ADMIN_EMAIL, '评论已保存!', JSON.stringify(data, null, 2));
            break;
        case 1:
            result = await commentCollection.updateOne({ _id: new ObjectId(comment.toId) }, { $inc: { like: 1 } });
            break;
        default:
            ctx.throw(501, '暂不支持');
    }
    ctx.body = getDataResult(result.insertedId || result.modifiedCount);
}

async function getCommentApp(app: string, key: string) {
    const commentApps = db.collection(COLLECTIONS.COMMENT_APP);
    return await commentApps.findOne({ name: app, accessKey: key });
}

export async function sendNotification(ctx: Context) {
    const { key, subject, content } = ctx.request.body;
    let { to } = ctx.request.body;
    if (!key) ctx.throw(400, 'key is required');
    if (!subject) ctx.throw(400, 'subject is required');
    if (!content) ctx.throw(400, 'content is required');
    if (key !== process.env.MAIL_PASSWORD) ctx.throw(403, 'invalid key');
    if (isEmpty(to)) to = ADMIN_EMAIL;
    await email(to, subject, content);
    ctx.status = 200;
}

export async function getAppStatus(ctx: Context) {
    if (!ctx.query.a) ctx.throw(400, 'a required');
    if (!ctx.query.v) ctx.throw(400, 'v required');

    const appStatus = await db.collection(COLLECTIONS.CONFIG).findOne({_id: CONFIG_KEYS.CONFIG_APP_STATUS});

    ctx.body = getDataResult(get(appStatus, `${ctx.query.a}.previewVersion`) === ctx.query.v);
}
