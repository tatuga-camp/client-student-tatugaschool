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

  const raw = req.query.subject_code;
  const code = typeof raw === "string" && raw.length > 0 ? raw : undefined;

  if (!code) {
    return res.status(200).json(buildFallbackManifest());
  }

  try {
    const subject = await GetSubjectByCodeService({ code });
    return res.status(200).json(buildSubjectManifest({ code, title: subject.title }));
  } catch (error) {
    console.error("manifest: subject lookup failed", error);
    return res.status(200).json(buildFallbackManifest());
  }
}
