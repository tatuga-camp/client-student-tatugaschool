import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildFallbackManifest,
  buildPageManifest,
  installMethod,
  pageManifestHref,
  parseStartUrl,
} from "./pwaManifest";

test("fallback manifest points at /welcome with brand name", () => {
  const m = buildFallbackManifest();
  assert.equal(m.start_url, "/welcome");
  assert.equal(m.id, "/welcome");
  assert.equal(m.name, "Tatuga School");
  assert.equal(m.icons.length, 3);
});

test("page manifest reopens on the page it was installed from", () => {
  const m = buildPageManifest({ startUrl: "/subject/abc", name: "Math 101" });
  assert.equal(m.start_url, "/subject/abc");
  assert.equal(m.id, "/subject/abc");
  assert.equal(m.name, "Math 101");
  assert.equal(m.short_name, "Math 101");
  assert.equal(m.scope, "/");
  assert.equal(m.display, "standalone");
  assert.equal(m.theme_color, "#2C7CD1");
  assert.equal(m.background_color, "#F7F8FA");
  assert.equal(m.icons.length, 3);
  assert.ok(m.icons.some((i) => i.purpose === "maskable"));
});

test("page manifest tidies the name and falls back to the brand", () => {
  assert.equal(buildPageManifest({ startUrl: "/x" }).name, "Tatuga School");
  assert.equal(buildPageManifest({ startUrl: "/x", name: "  \n " }).name, "Tatuga School");
  assert.equal(
    buildPageManifest({ startUrl: "/x", name: " Assignment:  Essay \n" }).name,
    "Assignment: Essay",
  );
  assert.equal(buildPageManifest({ startUrl: "/x", name: "a".repeat(500) }).name.length, 100);
});

test("parseStartUrl accepts same-origin paths only", () => {
  assert.equal(parseStartUrl("/student/1/subjects"), "/student/1/subjects");
  assert.equal(parseStartUrl("/?subject_code=fe765f"), "/?subject_code=fe765f");
  const rejected: unknown[] = [
    undefined,
    ["/a", "/b"],
    "",
    "subject/1",
    "https://evil.example/",
    "//evil.example/",
    "/\\evil.example",
    "/a\nb",
    "/" + "a".repeat(5000),
  ];
  for (const raw of rejected) {
    assert.equal(parseStartUrl(raw), undefined, JSON.stringify(raw));
  }
});

test("pageManifestHref drops the hash and encodes path and name", () => {
  assert.equal(
    pageManifestHref({ path: "/progress/t%20k?x=1#top", name: " Math & Art " }),
    "/api/manifest?start_url=%2Fprogress%2Ft%2520k%3Fx%3D1&name=Math%20%26%20Art",
  );
});

const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const MAC_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";

test("installMethod: iPhone and iPad add from Share, even in Chrome", () => {
  assert.equal(
    installMethod({ userAgent: IPHONE_UA, maxTouchPoints: 5, promptSupported: false }),
    "ios",
  );
  // iPadOS asks for desktop sites with a Mac user agent; the touch screen gives it away.
  assert.equal(
    installMethod({ userAgent: MAC_UA, maxTouchPoints: 5, promptSupported: false }),
    "ios",
  );
});

test("installMethod: Chromium shows its own prompt, the rest use the menu", () => {
  assert.equal(
    installMethod({ userAgent: ANDROID_UA, maxTouchPoints: 5, promptSupported: true }),
    "prompt",
  );
  assert.equal(
    installMethod({ userAgent: MAC_UA, maxTouchPoints: 0, promptSupported: true }),
    "prompt",
  );
  // Mac Safari, Firefox.
  assert.equal(
    installMethod({ userAgent: MAC_UA, maxTouchPoints: 0, promptSupported: false }),
    "menu",
  );
  assert.equal(
    installMethod({ userAgent: ANDROID_UA, maxTouchPoints: 5, promptSupported: false }),
    "menu",
  );
});
