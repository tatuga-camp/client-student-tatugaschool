import type { NextApiRequest, NextApiResponse } from "next";
import {
  buildFallbackManifest,
  buildPageManifest,
  parseStartUrl,
  WebAppManifest,
} from "../../utils/pwaManifest";

/**
 * Requested only after a student taps Me → Install app (InstallAppSheet
 * links it then), never on a plain page view.
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebAppManifest>,
) {
  res.setHeader("Content-Type", "application/manifest+json");
  res.setHeader("Cache-Control", "public, max-age=300");
  // Netlify's CDN cache key is the path only by default; the query string is
  // ignored, so every app would share one cached manifest (the first one
  // requested). Vary the edge cache on the params that shape the manifest so
  // each gets its own. See https://docs.netlify.com/build/caching/caching-overview
  res.setHeader("Netlify-Vary", "query=start_url|name");
  // Let Netlify's edge serve repeat requests without invoking this function.
  res.setHeader(
    "Netlify-CDN-Cache-Control",
    "public, durable, max-age=3600, stale-while-revalidate=86400",
  );

  const startUrl = parseStartUrl(req.query.start_url);
  const name = typeof req.query.name === "string" ? req.query.name : undefined;
  return res
    .status(200)
    .json(
      startUrl
        ? buildPageManifest({ startUrl, name })
        : buildFallbackManifest(),
    );
}
