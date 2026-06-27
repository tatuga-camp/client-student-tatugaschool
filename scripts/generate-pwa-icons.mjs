// One-off generator: favicon.ico -> PWA icon set. Run with the dev deps below.
//   npm install --no-save sharp decode-ico
//   node scripts/generate-pwa-icons.mjs
import { mkdirSync, readFileSync } from "node:fs";
import decodeIco from "decode-ico";
import sharp from "sharp";

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

const frames = decodeIco(readFileSync("public/favicon.ico"));
const best = frames.sort((a, b) => b.width - a.width)[0];
console.log(`Using ${best.width}x${best.height} frame from favicon.ico`);

// favicon.ico may store large frames as PNG-compressed data (type==="png"),
// in which case best.data is a PNG buffer — pass it directly to sharp.
// BMP-type frames carry raw RGBA pixels and need the raw descriptor.
const base = () =>
  best.type === "png"
    ? sharp(best.data)
    : sharp(best.data, {
        raw: { width: best.width, height: best.height, channels: 4 },
      });

mkdirSync("public/icons", { recursive: true });

await base().resize(192, 192).png().toFile("public/icons/icon-192.png");
await base().resize(512, 512).png().toFile("public/icons/icon-512.png");
await base().resize(180, 180).flatten({ background: WHITE }).png().toFile("public/apple-touch-icon.png");

// Maskable: artwork inside the ~80% safe zone on a solid background.
// Note: Sharp applies resize before extend internally, so we skip the final
// .resize(512,512) — the math 410+51+51=512 already gives the correct size.
await base()
  .resize(410, 410, { fit: "contain", background: WHITE })
  .extend({ top: 51, bottom: 51, left: 51, right: 51, background: WHITE })
  .flatten({ background: WHITE })
  .png()
  .toFile("public/icons/icon-maskable-512.png");

console.log("Wrote PWA icons to public/icons and public/apple-touch-icon.png");
