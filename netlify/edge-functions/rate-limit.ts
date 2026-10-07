// Pass-through edge function whose only job is to carry a Netlify rate-limit
// rule in front of the Next.js server handler (which the Next adapter
// generates without one). Netlify enforces `rateLimit` before edge functions
// and the edge/durable cache run, so a flood from one IP is answered with a
// 429 instead of invoking serverless functions.
// Docs: https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/
//
// No imports on purpose: this file is also picked up by the app's tsc run,
// and the Deno-only `@netlify/edge-functions` types aren't installed here.

// Returning undefined hands the request on unchanged.
export default () => undefined;

export const config = {
  path: "/*",
  // Files served from the CDN never invoke a function; don't count them.
  excludedPath: [
    "/_next/static/*",
    "/_next/image*",
    "/assets/*",
    "/icons/*",
    "/svg/*",
    "/favicon.ico",
    "/apple-touch-icon.png",
    "/sw.js",
    "/robots.txt",
    "/sitemap.xml",
  ],
  rateLimit: {
    // 6000/min (100 req/s) per IP, counted across every matched path.
    // Sized for a 3000-student school behind one NAT IP with ~30% (900)
    // opening the app in the same minute: each counts ~1-3 requests (first
    // HTML load, /api/manifest, a reload) because client navigation between
    // static pages hits only the CDN, so ~2700/min, ~2x headroom. Mobile
    // carrier CGNAT also puts unrelated students on one IP. The Sep 2026
    // flood was ~850 req/s, so a single-IP flood still trips this in seconds.
    windowLimit: 6000,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
