import { Context } from "koa";
import { logger } from "../log";
import { email, MY_EMAIL } from "../mail";
import { COLLECTIONS, db } from "../mongo";
import { getDataResult } from "../utils";

export async function getConfig(ctx: Context) {
    if (!ctx.query.k) ctx.throw(400, 'k required');
    const configs = db.collection(COLLECTIONS.CONFIG);
    const result = await configs.findOne({ _id: ctx.query.k });
    ctx.body = getDataResult(result);
}

export async function getComments(ctx: Context) {
    if (!ctx.query.k) ctx.throw(400, 'k required');
    if (!ctx.query.a) ctx.throw(400, 'a required');
    if (!ctx.query.t) ctx.throw(400, 't required');

    const app = await getCommentApp(ctx.query.a as string, ctx.query.k as string);
    if (!app) ctx.throw(401, '没有权限');

    const comments = db.collection(COLLECTIONS.COMMENT);
    const result = await comments.find({ app: ctx.query.a, topicId: ctx.query.t }, { projection: { _class: 0 } }).toArray();
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
        ctx.throw(400, '接口已屏蔽您的请求');
    }

    const app = await getCommentApp(comment.app, comment.key);
    if (!app) ctx.throw(401, '没有权限');

    const commentCollection = db.collection(COLLECTIONS.COMMENT);
    let result = null;
    switch (comment.type) {
        case 0:
            const data = {
                app: comment.app,
                topicId: comment.topic,
                content: comment.content,
                type: comment.type,
                fromUserId: comment.fromUserId,
                fromUserName: comment.fromUserName,
                fromUserIcon: comment.fromUserIcon,
                toId: comment.toId,
                deleted: false,
                createTime: new Date(),
                likeCount: 0
            };
            result = await commentCollection.insertOne(data);
            email(MY_EMAIL, '评论已保存!', JSON.stringify(data, null, 2));
            break;
        case 1:
            result = await commentCollection.updateOne({ _id: comment.toId }, { $inc: { likeCount: 1 } });
            break;
        default:
            ctx.throw(501, '暂不支持');
    }
    ctx.body = getDataResult(result.result);
}

async function getCommentApp(app: string, key: string) {
    const commentApps = db.collection(COLLECTIONS.COMMENT_APP);
    return await commentApps.findOne({ name: app, accessKey: key });
}
