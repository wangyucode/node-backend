import { processNginxLog } from "./analysis/analysis";
import { connectToDb } from "./mongo";



async function test(){
    await connectToDb();
    await processNginxLog();
}

test();