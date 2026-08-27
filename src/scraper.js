const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.tayyar.org';
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; NewsAgScraper/1.0)' };

async function fetchHtml(url) {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    return cheerio.load(data);
}

function absUrl(href) {
    if (!href) return null;
    return href.startsWith('http') ? href : BASE_URL + href;
}

/**
 * Scrapes the homepage and extracts Featured news, Exclusive and Live news sections.
 */
async function scrapeHomepage() {
    const $ = await fetchHtml(BASE_URL + '/');

    const featured = [];
    $('.Featured .swiper-slide').each((_, el) => {
        const $el = $(el);
        const link = $el.find('a.item').first();
        const href = absUrl(link.attr('href'));
        const title = link.find('h3.caption').text().trim();
        const image = link.find('img').attr('src') || null;
        const tag = link.find('.nametag').first().text().trim() || null;
        if (href && title) {
            featured.push({ id: $el.attr('data-article-id') || href, title, url: href, image, tag });
        }
    });

    const exclusive = [];
    $('.Exclusive .list > li').each((_, el) => {
        const $el = $(el);
        const link = $el.find('a.item').first();
        const href = absUrl(link.attr('href'));
        const title = link.find('h3.caption').text().trim();
        const image = link.find('img').attr('src') || null;
        if (href && title) {
            exclusive.push({ id: href, title, url: href, image });
        }
    });

    const live = [];
    $('#liveNewsList > li').each((_, el) => {
        const $el = $(el);
        const link = $el.find('a.news').first();
        const href = absUrl(link.attr('href')) || null;
        const title = link.find('h3.caption').clone().children().remove().end().text().trim();
        const time = $el.find('.clock').text().replace(/\s+/g, ' ').trim();
        if (title) {
            live.push({ id: $el.attr('data-livearticle-id'), title, url: href, time });
        }
    });

    return { featured, exclusive, live };
}

/**
 * Scrapes a single article page given its full URL.
 */
async function scrapeArticle(url) {
    const $ = await fetchHtml(url);

    const title = $('#MainArticleTitle').text().trim() || $('h1.title').first().text().trim();
    const image = $('.Article .photo img').first().attr('src') || $('meta[itemprop="image"]').attr('content') || null;
    const date = $('.Article .date').first().text().replace(/\s+/g, ' ').trim();
    const tags = [];
    $('.Article .taglist .nametag').each((_, el) => tags.push($(el).text().trim()));
    const $bodyEl = $('.Article .text').first().clone();
    $bodyEl.find('script, style').remove();
    const body = $bodyEl.text().replace(/\s+\n/g, '\n').trim();

    return { title, image, date, tags, body, url };
}

module.exports = { scrapeHomepage, scrapeArticle };
