import * as log4js from "log4js";

log4js.configure({
    appenders: {
        stdout: { type: 'stdout' },
        file: { type: 'file', filename: 'log/app.log' }
    },
    categories: {
        default: { appenders: ['stdout'], level: 'debug' },
        prod: { appenders: ['stdout', 'file'], level: 'info' }
    }
});

export const logger = log4js.getLogger(process.env.PROD === 'true' ? 'prod' : 'default');
