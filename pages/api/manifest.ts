import type { NextApiRequest, NextApiResponse } from "next";
import { GetSubjectByCodeService } from "../../services";
import {
  buildFallbackManifest,
  buildSubjectManifest,
  WebAppManifest,
} from "../../utils/pwaManifest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebAppManifest>,
) {
  res.setHeader("Content-Type", "application/manifest+json");
  res.setHeader("Cache-Control", "public, max-age=300");
  // Netlify's CDN cache key is the path only by default; the subject_code query
  // string is ignored, so every subject would share one cached manifest (the
  // first one requested). Vary the edge cache on subject_code so each subject
  // gets its own cached manifest. See https://docs.netlify.com/build/caching/caching-overview
  res.setHeader("Netlify-Vary", "query=subject_code");

  const raw = req.query.subject_code;
  const code = typeof raw === "string" && raw.length > 0 ? raw : undefined;

  if (!code) {
    return res.status(200).json(buildFallbackManifest());
  }

  try {
    const subject = await GetSubjectByCodeService({ code });
    return res
      .status(200)
      .json(buildSubjectManifest({ code, title: subject.title }));
  } catch (error) {
    console.error("manifest: subject lookup failed", error);
    return res.status(200).json(buildFallbackManifest());
  }
}
