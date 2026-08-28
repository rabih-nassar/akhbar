/**
 * Akhbar.FYI edge helpers.
 *
 * Only /proxy is routed here (see run_worker_first in wrangler.jsonc); every
 * other path is served straight from ./dist by the asset worker.
 *
 * /proxy?url=… re-fetches a news page and returns it with an
 * Access-Control-Allow-Origin header, because the sites we scrape don't send
 * one and the browser can't read them directly. It is restricted to the sites
 * the app actually reads so it can't be used as an open proxy.
 */

const ALLOWED_HOSTS = new Set([
    'tayyar.org', 'www.tayyar.org',
    'elnashra.com', 'www.elnashra.com',
    'lebanondebate.com', 'www.lebanondebate.com',
    'lebanonfiles.com', 'www.lebanonfiles.com',
]);

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// Ask for pages the way a browser would — these sites serve a bot challenge to
// anything that looks automated.
const UPSTREAM_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
};

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname !== '/proxy') return env.ASSETS.fetch(request);
        if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });
        if (request.method !== 'GET') return plain('Method not allowed', 405);

        const target = url.searchParams.get('url');
        if (!target) return plain('Missing url parameter', 400);

        let targetUrl;
        try {
            targetUrl = new URL(target);
        } catch (e) {
            return plain('Invalid url parameter', 400);
        }
        if (targetUrl.protocol !== 'https:' || !ALLOWED_HOSTS.has(targetUrl.hostname)) {
            return plain('Host not allowed', 403);
        }

        let upstream;
        try {
            upstream = await fetch(targetUrl.toString(), {
                headers: UPSTREAM_HEADERS,
                // Cache upstream HTML briefly so refreshing the page doesn't
                // re-fetch every article.
                cf: { cacheTtl: 120, cacheEverything: true },
            });
        } catch (e) {
            return plain('Upstream fetch failed', 502);
        }

        // Pass the upstream status through unchanged: the client treats a
        // non-OK response as a failed proxy and moves on to the next one.
        return new Response(upstream.body, {
            status: upstream.status,
            headers: {
                ...CORS_HEADERS,
                'Content-Type': upstream.headers.get('Content-Type') || 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=120',
            },
        });
    },
};

function plain(message, status) {
    return new Response(message, {
        status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
    });
}
