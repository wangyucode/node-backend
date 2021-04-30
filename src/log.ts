import * as log4js from "log4js";
import * as dotenv from "dotenv";

log4js.configure({
    appenders: {
        stdout: {type: 'stdout'},
        file: {type: 'file', filename: 'log/app.log'}
    },
    categories: {
        default: {appenders: ['stdout'], level: 'debug'},
        prod: {appenders: ['stdout', 'file'], level: 'info'}
    }
});
// env
dotenv.config({debug: true});
export const logger = log4js.getLogger(process.env.ENV === 'prod' ? 'prod' : 'default');

logger.info("process.env.ENV->", process.env.ENV);
