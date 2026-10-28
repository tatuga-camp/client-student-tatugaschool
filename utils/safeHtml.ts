import { createElement, Fragment } from "react";
import type { DOMNode } from "html-react-parser";

// Comment bodies are HTML written by other people (the teacher), so what is
// rendered is filtered: no active elements, no event handlers, no script URLs.
const BLOCKED_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
]);
const URL_ATTRS = new Set([
  "href",
  "src",
  "xlink:href",
  "action",
  "formaction",
]);
const SCRIPT_SCHEMES = /^(javascript|vbscript|data):/;

export function isBlockedTag(name: string): boolean {
  return BLOCKED_TAGS.has(name.toLowerCase());
}

/** The attributes that may stay on an element. */
export function cleanAttribs(
  attribs: Record<string, string>,
): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(attribs)) {
    const name = key.toLowerCase();
    if (name.startsWith("on")) continue;
    if (URL_ATTRS.has(name)) {
      // Browsers ignore whitespace and control characters inside a scheme.
      const url = value.replace(/[\u0000-\u0020]/g, "").toLowerCase();
      const imageData = name === "src" && url.startsWith("data:image/");
      if (SCRIPT_SCHEMES.test(url) && !imageData) continue;
    }
    clean[key] = value;
  }
  return clean;
}

/** `replace` option for html-react-parser: drops or cleans dangerous nodes. */
export function safeHtmlReplace(node: DOMNode) {
  const el = node as {
    type?: string;
    name?: string;
    attribs?: Record<string, string>;
  };
  if (el.type !== "tag" && el.type !== "script" && el.type !== "style") return;
  if (el.name && isBlockedTag(el.name)) return createElement(Fragment);
  if (el.attribs) el.attribs = cleanAttribs(el.attribs);
  return;
}
