import { cpSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src = path.join(root, "node_modules", "tinymce");
const dest = path.join(root, "public", "assets", "libs", "tinymce");

if (!existsSync(src)) {
  console.warn(`[copy-tinymce] source missing: ${src} — run \`npm install\` first.`);
  process.exit(0);
}

cpSync(src, dest, { recursive: true });
console.log(`[copy-tinymce] copied tinymce -> ${path.relative(root, dest)}`);
