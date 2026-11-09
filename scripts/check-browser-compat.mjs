// Fails the build when the client bundle holds JavaScript that older
// iPhones can't PARSE. A parse error is not a bug in one feature: the whole
// chunk is thrown away, and when that chunk is _app nothing on any page
// hydrates. The server-rendered page still looks right, but no button works.
// (2026-11: Next 16 targets Safari 16.4+ by default; class static blocks in
// _app left every iPhone on iOS 16.3 or older unable to pick a student.)
//
// The `browserslist` in package.json is what keeps these out. This check makes
// sure it stays that way: Next, a dependency, or a config change can bring
// them back.
//
// Syntax only: a missing API fails just where it's called, and can be
// feature-detected or polyfilled; a syntax error kills the whole chunk.
//
// Usage: node scripts/check-browser-compat.mjs [--min-ios=14]
// Runs as the postbuild script.

import { Parser } from "acorn";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const MIN_IOS = Number(
  process.argv.find((a) => a.startsWith("--min-ios="))?.split("=")[1] ?? 14,
);
const CHUNKS = join(process.cwd(), ".next", "static", "chunks");

/** Syntax newer than some iOS Safari, with the first version that parses it. */
function findings(node, out) {
  if (!node || typeof node.type !== "string") return;
  switch (node.type) {
    case "StaticBlock":
      out.push({ ios: 16.4, what: "class static block", at: node.start });
      break;
    case "MethodDefinition":
    case "PropertyDefinition":
      if (node.key?.type === "PrivateIdentifier" && node.type === "MethodDefinition")
        out.push({ ios: 15, what: "private class method", at: node.start });
      break;
    case "BinaryExpression":
      if (node.operator === "in" && node.left?.type === "PrivateIdentifier")
        out.push({ ios: 15, what: "#field in obj", at: node.start });
      break;
    case "Literal":
      if (node.regex) {
        const { pattern, flags } = node.regex;
        if (flags.includes("v"))
          out.push({ ios: 17, what: "RegExp v flag", at: node.start });
        if (/\(\?<[=!]/.test(pattern))
          out.push({ ios: 16.4, what: "RegExp lookbehind", at: node.start });
      }
      break;
  }
  for (const key in node) {
    if (key === "start" || key === "end" || key === "loc") continue;
    const value = node[key];
    if (Array.isArray(value)) for (const child of value) findings(child, out);
    else if (value && typeof value === "object") findings(value, out);
  }
}

function parse(source) {
  const options = { ecmaVersion: "latest", allowHashBang: true };
  try {
    return Parser.parse(source, { ...options, sourceType: "script" });
  } catch {
    return Parser.parse(source, { ...options, sourceType: "module" });
  }
}

function* jsFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* jsFiles(path);
    else if (entry.name.endsWith(".js")) yield path;
  }
}

let files = 0;
const problems = [];
try {
  for (const file of jsFiles(CHUNKS)) {
    files++;
    const source = readFileSync(file, "utf8");
    const found = [];
    findings(parse(source), found);
    for (const f of found.filter((f) => f.ios > MIN_IOS)) {
      const excerpt = source
        .slice(Math.max(0, f.at - 50), f.at + 70)
        .replace(/\s+/g, " ");
      problems.push(
        `✗ ${f.what} (needs iOS ${f.ios}+)\n  ${relative(process.cwd(), file)}\n  …${excerpt}…`,
      );
    }
  }
} catch (error) {
  if (error.code === "ENOENT") {
    console.error(`No build output at ${CHUNKS}: run \`next build\` first.`);
    process.exit(1);
  }
  throw error;
}

if (problems.length > 0) {
  console.error(problems.join("\n\n"));
  console.error(
    `\n${problems.length} construct(s) in the client bundle that iOS ${MIN_IOS} ` +
      "can't parse. Check the browserslist in package.json, or transpile the " +
      "dependency that brings them in (next.config transpilePackages).",
  );
  process.exit(1);
}
console.log(
  `Browser compat: ${files} client chunks parse on iOS ${MIN_IOS}+ Safari.`,
);
