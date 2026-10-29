import parse, {
  domToReact,
  type DOMNode,
  type HTMLReactParserOptions,
} from "html-react-parser";
import { createElement, Fragment, isValidElement, type ReactNode } from "react";

// Comment bodies are HTML written by other people (the teacher), so what is
// rendered is an ALLOWLIST: known formatting tags, known attributes, safe
// URLs and a few safe style properties. Everything else is unwrapped (unknown
// tags) or dropped with its content (active, embedded and SVG/MathML tags).

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "div",
  "span",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "strike",
  "sub",
  "sup",
  "small",
  "mark",
  "code",
  "pre",
  "blockquote",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
  "colgroup",
  "col",
  "figure",
  "figcaption",
]);

/** Dropped together with their content. */
const DROPPED_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "frame",
  "frameset",
  "object",
  "embed",
  "applet",
  "form",
  "input",
  "button",
  "select",
  "textarea",
  "svg",
  "math",
  "template",
  "noscript",
  "base",
  "meta",
  "link",
  "title",
  "head",
]);

const SIZE_TAGS = new Set(["img", "td", "th", "col"]);
const STYLE_PROPS = new Set([
  "color",
  "background-color",
  "text-align",
  "text-decoration",
  "font-weight",
  "font-style",
  "font-size",
  "list-style-type",
]);
const BAD_STYLE_VALUE = /url\(|expression|javascript:|@import|\\|</i;

export function isAllowedTag(name: string): boolean {
  return ALLOWED_TAGS.has(name.toLowerCase());
}

export function isDroppedTag(name: string): boolean {
  return DROPPED_TAGS.has(name.toLowerCase());
}

const NAMED_ENTITIES: Record<string, string> = {
  colon: ":",
  tab: "\t",
  newline: "\n",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

/** Enough entity decoding to see through "jav&#x61;script&colon;". */
function decodeEntities(value: string): string {
  return value.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z]+);?/gi,
    (whole, body: string) => {
      if (body[0] === "#") {
        const code =
          body[1].toLowerCase() === "x"
            ? parseInt(body.slice(2), 16)
            : parseInt(body.slice(1), 10);
        return Number.isFinite(code) && code < 0x110000
          ? String.fromCodePoint(code)
          : "";
      }
      return NAMED_ENTITIES[body.toLowerCase()] ?? whole;
    },
  );
}

/** The URL if the attribute may carry it, else null. */
export function cleanUrl(attr: "href" | "src", value: string): string | null {
  // Browsers ignore whitespace and control characters inside a scheme.
  const seen = decodeEntities(value)
    .replace(/[\u0000- ]/g, "")
    .toLowerCase();
  if (attr === "src") {
    return seen.startsWith("https:") ||
      /^data:image\/(png|jpeg|gif|webp)[;,]/.test(seen)
      ? value.trim()
      : null;
  }
  const hasScheme = /^[a-z][a-z0-9+.-]*:/.test(seen);
  if (hasScheme) {
    return /^(https?|mailto):/.test(seen) ? value.trim() : null;
  }
  // Relative: not protocol-relative ("//host", or "/\host" read as one).
  return /^[/\\]{2}/.test(seen) || seen.startsWith("/\\") ? null : value.trim();
}

const MAX_STYLE_LENGTH = 500;

/** Only harmless declarations; null when nothing is left. */
export function cleanStyle(rawStyle: string): string | null {
  // Long values are refused before any parsing (no quadratic work).
  if (rawStyle.length > MAX_STYLE_LENGTH) return null;
  // Comments can hide a property or a "url(" from the checks below.
  const style = rawStyle
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\*[\s\S]*$/, "");
  const kept: string[] = [];
  for (const declaration of style.split(";")) {
    const at = declaration.indexOf(":");
    if (at < 0) continue;
    const prop = declaration.slice(0, at).trim().toLowerCase();
    const value = declaration.slice(at + 1).trim();
    // No margin or padding: a comment must not push over the page.
    if (
      !STYLE_PROPS.has(prop) ||
      !value ||
      BAD_STYLE_VALUE.test(decodeEntities(value))
    )
      continue;
    kept.push(`${prop}:${value}`);
  }
  return kept.length > 0 ? kept.join(";") : null;
}

/** The attributes of an allowed element that may stay (names lower-cased). */
function cleanAttribs(
  tag: string,
  attribs: Record<string, string>,
): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const [rawName, value] of Object.entries(attribs)) {
    const name = rawName.toLowerCase();
    if (name === "title") clean.title = value;
    else if (name === "style") {
      const style = cleanStyle(value);
      if (style) clean.style = style;
    } else if (name === "href" && tag === "a") {
      const href = cleanUrl("href", value);
      if (href) clean.href = href;
    } else if (name === "src" && tag === "img") {
      const src = cleanUrl("src", value);
      if (src) clean.src = src;
    } else if (name === "alt" && tag === "img") clean.alt = value;
    else if (
      (name === "colspan" || name === "rowspan") &&
      (tag === "td" || tag === "th") &&
      /^\d{1,3}$/.test(value)
    )
      clean[name] = value;
    else if (
      (name === "width" || name === "height") &&
      SIZE_TAGS.has(tag) &&
      /^\d+(\.\d+)?(px|%)?$/.test(value)
    )
      clean[name] = value;
  }
  if (tag === "a" && clean.href) {
    clean.target = "_blank";
    clean.rel = "noopener noreferrer";
  }
  return clean;
}

type ElementLike = {
  type?: string;
  name?: string;
  attribs?: Record<string, string>;
  children?: DOMNode[];
};

export const safeHtmlOptions: HTMLReactParserOptions = {
  replace(node: DOMNode) {
    const el = node as ElementLike;
    if (el.type !== "tag" && el.type !== "script" && el.type !== "style")
      return;
    const name = (el.name ?? "").toLowerCase();
    if (isDroppedTag(name)) return createElement(Fragment);
    const children = (el.children ?? []) as DOMNode[];
    if (!isAllowedTag(name)) {
      // Unknown tag: keep what it wraps, lose the tag.
      return createElement(
        Fragment,
        null,
        domToReact(children, safeHtmlOptions),
      );
    }
    const attribs = cleanAttribs(name, el.attribs ?? {});
    if (name === "a" && !attribs.href) {
      return createElement(
        Fragment,
        null,
        domToReact(children, safeHtmlOptions),
      );
    }
    // An image without a usable source shows nothing but a broken icon.
    if (name === "img" && !attribs.src) return createElement(Fragment);
    el.attribs = attribs;
    return undefined;
  },
};

/** Whether anything a student could see is in the rendered tree (no recursion). */
function hasVisibleContent(root: ReactNode): boolean {
  const stack: ReactNode[] = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (node === null || node === undefined || typeof node === "boolean")
      continue;
    if (typeof node === "string" || typeof node === "number") {
      if (String(node).trim().length > 0) return true;
    } else if (Array.isArray(node)) {
      stack.push(...node);
    } else if (isValidElement(node)) {
      if (node.type === "img" || node.type === "hr") return true;
      stack.push((node.props as { children?: ReactNode }).children);
    }
  }
  return false;
}

/** A comment body as safe React nodes, and whether it shows anything. */
export function parseSafeHtml(html: string): {
  content: ReactNode;
  visible: boolean;
} {
  try {
    const content = parse(html ?? "", safeHtmlOptions);
    return { content, visible: hasVisibleContent(content) };
  } catch {
    // Absurdly deep markup: show nothing rather than break the pane.
    return { content: null, visible: false };
  }
}
