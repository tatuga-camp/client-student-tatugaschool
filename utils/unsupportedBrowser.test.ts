import { test } from "node:test";
import assert from "node:assert/strict";
import { Parser } from "acorn";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NOTICE_CSS, NOTICE_ID, NOTICE_SCRIPT_SRC } from "./unsupportedBrowser";

const root = join(__dirname, "..");
const NOTICE_SCRIPT = readFileSync(join(root, "public", NOTICE_SCRIPT_SRC), "utf8");
const NOTICE_TSX = readFileSync(
  join(root, "components", "app", "UnsupportedBrowserNotice.tsx"),
  "utf8",
);

test("the detection script parses as ES5 (it must run on old browsers)", () => {
  assert.doesNotThrow(() =>
    Parser.parse(NOTICE_SCRIPT, { ecmaVersion: 5, sourceType: "script" }),
  );
});

test("the notice CSS is not inside @layer, and safe as <style> text", () => {
  assert.ok(!NOTICE_CSS.includes("@layer"));
  assert.ok(NOTICE_CSS.includes("#__next{display:none"));
  // React escapes these in server-rendered <style> text.
  assert.ok(!/["'&<>]/.test(NOTICE_CSS));
});

test("the notice styles itself inline, with no app classes", () => {
  assert.ok(!/className=/.test(NOTICE_TSX));
  assert.ok(NOTICE_TSX.includes("iOS 15.4"));
  // The hooks the script fills in.
  for (const hook of ["data-ub-device", "data-ub-ios", "data-ub-link"])
    assert.ok(NOTICE_TSX.includes(hook), hook);
  assert.ok(NOTICE_SCRIPT.includes(`"${NOTICE_ID}"`));
});

type FakeEl = {
  hidden?: boolean;
  textContent: string;
  style: Record<string, string>;
  offsetWidth: number;
  id?: string;
};

/** Runs the script against a fake browser; returns what it changed. */
function run({
  dvh,
  layers,
  ua,
}: {
  dvh: boolean;
  layers: boolean;
  ua: string;
}) {
  const el = (): FakeEl => ({ textContent: "", style: {}, offsetWidth: 0 });
  const device = el();
  const ios = el();
  const link = el();
  const notice = {
    ...el(),
    hidden: true,
    querySelector: (sel: string) =>
      ({
        "[data-ub-device]": device,
        "[data-ub-ios]": ios,
        "[data-ub-link]": link,
      })[sel] ?? null,
  };
  const html = { className: "" };
  let measured = false;
  const document = {
    documentElement: html,
    // Any layout read would be wrong: the body may still be display:none.
    head: { appendChild: () => (measured = true), removeChild() {} },
    body: { appendChild: () => (measured = true), removeChild() {} },
    createElement: () => {
      measured = true;
      return el();
    },
    getElementById: (id: string) => (id === NOTICE_ID ? notice : null),
  };
  const CSS = { supports: (_p: string, v: string) => v !== "100dvh" || dvh };
  const window = layers
    ? { CSS, CSSLayerBlockRule: function CSSLayerBlockRule() {} }
    : { CSS };
  new Function("window", "CSS", "document", "navigator", "location", NOTICE_SCRIPT)(
    window,
    CSS,
    document,
    { userAgent: ua },
    { href: "https://student.tatugaschool.com/?subject_code=abc123" },
  );
  return { html, notice, device, ios, link, measured };
}

const IOS_14 =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1";
const ANDROID =
  "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0 Mobile Safari/537.36";

test("a modern browser keeps the app: no notice", () => {
  const r = run({ dvh: true, layers: true, ua: IOS_14 });
  assert.equal(r.html.className, "");
  assert.equal(r.notice.hidden, true);
});

// `next dev` hides <body> until its CSS loads; a layout probe read 0px there
// and showed the notice on Chrome on Windows.
test("detection reads no layout, so a still-hidden body can't trip it", () => {
  const r = run({ dvh: true, layers: true, ua: IOS_14 });
  assert.equal(r.measured, false);
});

test("no dvh (iOS < 15.4): notice with the iOS version and the link", () => {
  const r = run({ dvh: false, layers: false, ua: IOS_14 });
  assert.match(r.html.className, /ub-old/);
  assert.equal(r.notice.hidden, false);
  assert.match(r.device.textContent, /iOS 14\.8/);
  assert.equal(r.device.style.display, "block");
  assert.notEqual(r.ios.style.display, "none");
  assert.match(r.link.textContent, /subject_code=abc123/);
});

test("dvh but no @layer: notice too", () => {
  const r = run({ dvh: true, layers: false, ua: ANDROID });
  assert.equal(r.notice.hidden, false);
});

test("not iOS: the iOS update step is hidden, no device line", () => {
  const r = run({ dvh: false, layers: false, ua: ANDROID });
  assert.equal(r.ios.style.display, "none");
  assert.equal(r.device.style.display ?? "", "");
});
