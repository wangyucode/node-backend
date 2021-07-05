import * as log4js from "log4js";
import * as dotenv from "dotenv";
import { isProd } from "./utils";

log4js.configure({
    appenders: {
        stdout: {type: 'stdout'},
        file: {type: 'file', filename: 'log/app.log'}
    },
    categories: {
        default: {appenders: ['stdout', 'file'], level: 'debug'},
        prod: {appenders: ['stdout', 'file'], level: 'info'}
    }
});
// env
dotenv.config();
export const logger = log4js.getLogger(isProd() ? 'prod' : 'default');

logger.info("process.env.ENV->", process.env.ENV);
