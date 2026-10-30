export type WebAppManifest = {
  id: string;
  name: string;
  short_name: string;
  start_url: string;
  scope: string;
  display: "standalone";
  theme_color: string;
  background_color: string;
  icons: { src: string; sizes: string; type: string; purpose: string }[];
};

const THEME_COLOR = "#2C7CD1";
const BACKGROUND_COLOR = "#F7F8FA";
const BRAND_NAME = "Tatuga School";
const MAX_NAME_LENGTH = 100;
const MAX_START_URL_LENGTH = 2048;

const ICONS: WebAppManifest["icons"] = [
  { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
];

function normalizeName(name: string | undefined): string {
  return (name ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

// id follows start_url, so each start page installs as its own app.
function buildManifest(url: string, name: string): WebAppManifest {
  return {
    id: url,
    name,
    short_name: name,
    start_url: url,
    scope: "/",
    display: "standalone",
    theme_color: THEME_COLOR,
    background_color: BACKGROUND_COLOR,
    icons: ICONS,
  };
}

export function buildFallbackManifest(): WebAppManifest {
  return buildManifest("/welcome", BRAND_NAME);
}

/** Manifest for an app that reopens on the page it was installed from. */
export function buildPageManifest(params: { startUrl: string; name?: string }): WebAppManifest {
  return buildManifest(params.startUrl, normalizeName(params.name) || BRAND_NAME);
}

/**
 * Accepts only a same-origin path like "/subject/1?x=y". Rejects
 * protocol-relative "//host" and "/\host", which browsers resolve off-site.
 */
export function parseStartUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string" || raw.length > MAX_START_URL_LENGTH) return undefined;
  if (!/^\/(?![/\\])/.test(raw) || /[\u0000-\u001f\u007f]/.test(raw)) return undefined;
  return raw;
}

/** The manifest link for any page; the hash isn't part of the app's URL. */
export function pageManifestHref(params: { path: string; name: string }): string {
  const startUrl = params.path.split("#")[0];
  return `/api/manifest?start_url=${encodeURIComponent(startUrl)}&name=${encodeURIComponent(normalizeName(params.name))}`;
}

/** How this browser installs a web app. */
export type InstallMethod = "prompt" | "ios" | "menu";

/**
 * "prompt": Chromium's own install dialog (beforeinstallprompt). "ios":
 * Share → Add to Home Screen, the only way on iPhone/iPad in any browser.
 * "menu": everything else, from the browser's menu.
 */
export function installMethod(env: {
  userAgent: string;
  maxTouchPoints: number;
  promptSupported: boolean;
}): InstallMethod {
  // iPadOS asks for desktop sites with a Mac user agent; only the touch
  // screen gives it away.
  const ios =
    /iphone|ipad|ipod/i.test(env.userAgent) ||
    (/macintosh/i.test(env.userAgent) && env.maxTouchPoints > 1);
  if (ios) return "ios";
  return env.promptSupported ? "prompt" : "menu";
}

/** True inside the installed app. */
export function isStandaloneApp(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}
