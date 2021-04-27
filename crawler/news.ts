import puppeteer from "puppeteer/lib/cjs/puppeteer/node-puppeteer-core";
import { logger } from "../app";
import { sleep } from "../utils";

export let news = [];

export async function crawlNews() {
    const url = Buffer.from('aHR0cHM6Ly93d3cuZG90YTIuY29tLmNuL25ld3MvaW5kZXg=', "base64").toString('utf-8')
    logger.debug(url);
    const browser = await puppeteer.launch({
        devtools: true,
        defaultViewport: null
    });
    const pages = await browser.pages();

    for (let i = 1; i < 6; i++) {
        await pages[0].goto(`${url}${i}.html`);
        await sleep(1000);
        const pageNews = await pages[0].evaluate(() => {
            const pageNews = [];
            document.querySelectorAll('a.item').forEach((it: any) => {
                pageNews.push({
                    href: it.href,
                    img: it.querySelector('img').src,
                    title: it.querySelector('h2').innerText,
                    content: it.querySelector('p.content').innerText,
                    date: it.querySelector('p.date').innerText,
                })
            });
            return pageNews;
        });

        news = news.concat(pageNews);
        // TODO
        break;
    }

    logger.debug(news);

    for (const it of news) {
        await pages[0].goto(it.href);
        await sleep(1000);
    }

    //await browser.close();
}