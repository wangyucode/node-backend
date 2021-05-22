import { Db, MongoClient } from "mongodb"
import { logger } from "./log";


const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, { useUnifiedTopology: true });

export let db: Db;

export enum COLLECTIONS {
    COMMENT_APP = 'mongoCommentApp',
    DOTA_ITEM = 'mongoDotaItem',
    DOTA_HERO_DETAIL = 'mongoHeroDetail',
    COMMENT = 'mongoComment',
    CONFIG = 'wyConfig'
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
    }
}
