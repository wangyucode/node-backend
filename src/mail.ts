import * as nodemailer from 'nodemailer';
import { logger } from './log';

export const MY_EMAIL = "wangyu@wycode.cn";

let transporter = null;

export async function email(to: string, subject: string, text: string) {
    if (transporter === null) {
        transporter = nodemailer.createTransport({
            host: "smtp.exmail.qq.com",
            port: 465,
            secure: true,
            auth: {
                user: MY_EMAIL,
                pass: process.env.MAIL_PASSWORD
            }
        });
    }

    var message = { from: MY_EMAIL, to, subject, text };

    let result = await transporter.sendMail(message);

    logger.info('email-->', result);

}