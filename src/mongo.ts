import { Db, MongoClient } from "mongodb"
import { logger } from "./log";
import { email, MY_EMAIL } from "./mail";


const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, { useUnifiedTopology: true, serverSelectionTimeoutMS: 5 * 60 * 1000 });

export let db: Db;

export enum COLLECTIONS {
    COMMENT_APP = 'mongoCommentApp',
    DOTA_ITEM = 'mongoDotaItem',
    DOTA_HERO_DETAIL = 'mongoHeroDetail',
    DOTA_NEWS = 'dotaNews',
    COMMENT = 'comments',
    CONFIG = 'wyConfig',
    CLIPBOARD = 'clipboard',
    ANALYSIS = 'analysis'
}

export enum CONFIG_KEYS {
    CONFIG_DOTA_VERSION = 'CONFIG_DOTA_VERSION',
    CONFIG_DOTA_SCHEDULES = 'CONFIG_DOTA_SCHEDULES',
    CONFIG_DOTA_LEAGUES = 'CONFIG_DOTA_LEAGUES',
    CONFIG_DOTA_TEAMS = 'CONFIG_DOTA_TEAMS',
    CONFIG_DOTA_LEADERBOARD = 'CONFIG_DOTA_LEADERBOARD',
    CONFIG_NOTIFICATION_CLIPBOARD = 'CONFIG_NOTIFICATION_CLIPBOARD'
}

export async function connectToDb() {
    try {
        // Connect the client to the server
        await client.connect();
        // Establish and verify connection
        db = await client.db("wycode");
        await db.command({ ping: 1 });
        logger.info("Connected successfully to mongodb");
    } catch (e) {
        logger.error("mongo connect error", e);
        await email(MY_EMAIL, "[node-backend] can not connect to mongodb", e.toString())
    }
}
