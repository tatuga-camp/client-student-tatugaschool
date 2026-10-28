import test from "node:test";
import assert from "node:assert/strict";
import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import parse from "html-react-parser";
import { cleanAttribs, isBlockedTag, safeHtmlReplace } from "./safeHtml";

const render = (html: string) =>
  renderToStaticMarkup(
    createElement(Fragment, null, parse(html, { replace: safeHtmlReplace })),
  );

test("isBlockedTag lists the dangerous elements, any case", () => {
  for (const tag of ["script", "STYLE", "iframe", "object", "embed", "form"]) {
    assert.equal(isBlockedTag(tag), true, tag);
  }
  for (const tag of ["p", "b", "a", "img", "ul"]) {
    assert.equal(isBlockedTag(tag), false, tag);
  }
});

test("blocked elements and their content are dropped", () => {
  assert.equal(
    render("<p>a</p><script>alert(1)</script><p>b</p>"),
    "<p>a</p><p>b</p>",
  );
  assert.equal(render("<style>p{display:none}</style>x"), "x");
  assert.equal(render('<iframe src="https://x"></iframe>x'), "x");
  assert.equal(render("<object data=x></object><embed src=x>y"), "y");
  assert.equal(render('<form action="/x"><input></form>z'), "z");
});

test("on* attributes are stripped", () => {
  assert.equal(
    render('<img src="https://x/a.png" onerror="alert(1)">'),
    '<img src="https://x/a.png"/>',
  );
  assert.equal(render('<p onclick="x()" ONMOUSEOVER="y()">t</p>'), "<p>t</p>");
});

test("script-like URL schemes are dropped, even disguised", () => {
  assert.equal(render('<a href="javascript:alert(1)">x</a>'), "<a>x</a>");
  assert.equal(render('<a href=" JaVa\tScRiPt:alert(1)">x</a>'), "<a>x</a>");
  assert.equal(render('<a href="vbscript:x">x</a>'), "<a>x</a>");
  assert.equal(render('<a href="data:text/html,<b>x</b>">x</a>'), "<a>x</a>");
  assert.equal(render('<img src="javascript:alert(1)">'), "<img/>");
  assert.equal(render('<img src="data:text/html;base64,AAAA">'), "<img/>");
});

test("data:image survives on src only", () => {
  assert.equal(
    render('<img src="data:image/png;base64,AAAA">'),
    '<img src="data:image/png;base64,AAAA"/>',
  );
  assert.equal(
    render('<a href="data:image/png;base64,AAAA">x</a>'),
    "<a>x</a>",
  );
});

test("normal formatting survives", () => {
  assert.equal(
    render(
      '<p>hi <b>bold</b> <i>it</i><br>line</p><ul><li>one</li></ul><a href="https://x.com/a?b=1">link</a>',
    ),
    '<p>hi <b>bold</b> <i>it</i><br/>line</p><ul><li>one</li></ul><a href="https://x.com/a?b=1">link</a>',
  );
});

test("cleanAttribs keeps harmless attributes", () => {
  assert.deepEqual(
    cleanAttribs({ href: "https://x", class: "c", title: "t" }),
    {
      href: "https://x",
      class: "c",
      title: "t",
    },
  );
});
