// Shows the "browser too old" notice (components/app/UnsupportedBrowserNotice)
// when CSS @layer or dvh units are missing: below iOS 15.4 / Chrome 108 the
// app's CSS is skipped and the page would render unstyled. Tests the features,
// not the user agent. ES5 on purpose: it runs on the browsers it guards
// against, before React (utils/unsupportedBrowser.test.ts parses it as ES5).
(function () {
  try {
    var ok = !!(
      window.CSS &&
      CSS.supports &&
      CSS.supports("height", "100dvh")
    );
    if (ok) {
      var s = document.createElement("style");
      s.textContent = "@layer ub{#ub-probe{width:7px}}";
      document.head.appendChild(s);
      var p = document.createElement("div");
      p.id = "ub-probe";
      p.style.position = "absolute";
      p.style.visibility = "hidden";
      document.body.appendChild(p);
      ok = p.offsetWidth === 7;
      document.body.removeChild(p);
      document.head.removeChild(s);
    }
    if (ok) return;

    document.documentElement.className += " ub-old";
    var n = document.getElementById("unsupported-browser");
    if (!n) return;
    n.hidden = false;

    var ua = navigator.userAgent || "";
    var m = /(?:iPhone|iPad|iPod).*? OS (\d+)_(\d+)/.exec(ua);
    var d = n.querySelector("[data-ub-device]");
    if (m && d) {
      var v = m[1] + "." + m[2];
      d.textContent = "อุปกรณ์นี้ใช้ iOS " + v + " · This device runs iOS " + v;
      d.style.display = "block";
    }
    var i = n.querySelector("[data-ub-ios]");
    if (!m && i) i.style.display = "none";
    var l = n.querySelector("[data-ub-link]");
    if (l) l.textContent = location.href;
  } catch (e) {}
})();
