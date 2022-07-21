import { processNginxLog } from "./analysis/analysis";
import { connectToDb } from "./mongo";

async function test(){
    return '171.209.131.227 - - [20/Jul/2022:13:06:02 +0800] "GET /upload/image/fish/reward.jpg HTTP/1.1" 200 83620 "https://servicewechat.com/wx8a383e1143f5b2c9/9/page-frame.html" ""'.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) - .+ \[(.*)\] "(.*)" (\d{3}) \d+ ".+" "(.*)"$/)
    // await connectToDb();
    // await processNginxLog();
}

console.log('result->',test());