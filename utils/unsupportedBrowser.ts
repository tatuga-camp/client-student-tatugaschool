// The oldest browsers the student app runs on: iOS 15.4 Safari (and every
// iOS browser, which is the same WebKit), Chrome 108. Below that the app's CSS
// is skipped (it's wrapped in @layer, iOS 15.4+ / Chrome 99+) and screen-height
// units are missing (dvh, iOS 15.4+ / Chrome 108+), so the page renders
// unstyled. Such a browser gets a notice instead.
//
// The notice can rely on neither, so it is three plain pieces, all rendered by
// pages/_document.tsx:
// - NOTICE_CSS: one rule outside any @layer that hides the app meanwhile;
// - components/app/UnsupportedBrowserNotice: the markup, inline styles only;
// - public/unsupported-browser.js: an ES5 script that runs before React,
//   tests the two features (not the user agent) and shows the notice.

export const NOTICE_ID = "unsupported-browser";
export const NOTICE_SCRIPT_SRC = "/unsupported-browser.js";

/**
 * Hides the app while the notice shows. Outside @layer, so old Safari applies
 * it. No quotes, ampersands, < or >: React escapes those in a <style>'s
 * server-rendered text.
 */
export const NOTICE_CSS =
  "html.ub-old #__next{display:none!important}" +
  "html.ub-old,html.ub-old body{overflow:auto!important;height:auto!important}";
