import * as nodemailer from 'nodemailer';
import { logger } from './log';

export const ADMIN_EMAIL = ['wangyu@wycode.cn', 'huangyi@wycode.cn'];

let transporter = null;

export async function email(to: string[], subject: string, text: string) {
    if (transporter === null) {
        transporter = nodemailer.createTransport({
            host: "smtp.exmail.qq.com",
            port: 465,
            secure: true,
            auth: {
                user: ADMIN_EMAIL[0],
                pass: process.env.MAIL_PASSWORD
            }
        });
    }

    const message = { from: ADMIN_EMAIL[0], subject, text, to: null };

    const sendingPromises = to.map(t => {
        message.to = t;
        return transporter.sendMail(message);
    });

    Promise.all(sendingPromises).then(() => logger.info(`Sent mail to ${to.toString()}`));
}