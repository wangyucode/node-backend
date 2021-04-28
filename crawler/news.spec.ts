import {crawlNews, news, newsDetail} from "./news";

test("crawlNews", async function () {
    await crawlNews();
    expect(news.length).toBe(8);
    expect(news[0].img.startsWith('/dota2static/')).toBe(true);
    expect(newsDetail.size).toBeGreaterThan(0);
}, 60000);
