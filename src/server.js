const express = require('express');
const path = require('path');
const { scrapeHomepage, scrapeArticle } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '..', 'public')));

// Scrapes the homepage fresh on every request (per requirement: reload => rescrape)
app.get('/api/home', async (req, res) => {
    try {
        const data = await scrapeHomepage();
        res.json(data);
    } catch (err) {
        console.error('Home scrape failed:', err.message);
        res.status(502).json({ error: 'Failed to scrape homepage', details: err.message });
    }
});

// Scrapes a single article on demand when the user clicks a headline
app.get('/api/article', async (req, res) => {
    const { url } = req.query;
    if (!url || !url.startsWith('https://www.tayyar.org')) {
        return res.status(400).json({ error: 'Invalid or missing url parameter' });
    }
    try {
        const data = await scrapeArticle(url);
        res.json(data);
    } catch (err) {
        console.error('Article scrape failed:', err.message);
        res.status(502).json({ error: 'Failed to scrape article', details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Akhbar.FYI server running at http://localhost:${PORT}`);
});
