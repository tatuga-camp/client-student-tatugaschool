import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { createElement, Fragment } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanStyle, cleanUrl, parseSafeHtml } from "./safeHtml";

const render = (html: string) =>
  renderToStaticMarkup(
    createElement(Fragment, null, parseSafeHtml(html).content),
  );

test("normal formatting survives", () => {
  assert.equal(
    render("<p>hi <b>bold</b> <i>it</i><br>line</p><ul><li>one</li></ul>"),
    "<p>hi <b>bold</b> <i>it</i><br/>line</p><ul><li>one</li></ul>",
  );
  assert.equal(
    render(
      '<table><tbody><tr><th colspan="2">h</th></tr><tr><td>a</td><td>b</td></tr></tbody></table>',
    ),
    '<table><tbody><tr><th colSpan="2">h</th></tr><tr><td>a</td><td>b</td></tr></tbody></table>',
  );
  assert.equal(
    render('<span style="color: red; font-weight:bold">x</span>'),
    '<span style="color:red;font-weight:bold">x</span>',
  );
});

test("an https link keeps its href and gets target and rel", () => {
  assert.equal(
    render('<a href="https://x.com/a?b=1" title="t">link</a>'),
    '<a href="https://x.com/a?b=1" title="t" target="_blank" rel="noopener noreferrer">link</a>',
  );
  assert.equal(
    render('<a href="mailto:a@b.c">m</a>'),
    '<a href="mailto:a@b.c" target="_blank" rel="noopener noreferrer">m</a>',
  );
});

test("a link that loses its href becomes plain text", () => {
  assert.equal(render('<a href="javascript:alert(1)">x</a>'), "x");
  assert.equal(render('<a href=" JaVa\tScRiPt:alert(1)">x</a>'), "x");
  assert.equal(render('<a href="jav&#x61;script&colon;alert(1)">x</a>'), "x");
  assert.equal(render('<a href="vbscript:x">x</a>'), "x");
  assert.equal(render('<a href="data:text/html,<b>x</b>">x</a>'), "x");
  assert.equal(render('<a href="//evil.example/x">x</a>'), "x");
  assert.equal(render('<a href="/\\evil.example">x</a>'), "x");
});

test("relative links are allowed", () => {
  assert.equal(
    render('<a href="/subject/1">x</a>'),
    '<a href="/subject/1" target="_blank" rel="noopener noreferrer">x</a>',
  );
});

test("active elements are dropped with their content", () => {
  for (const html of [
    "<script>alert(1)</script>",
    "<style>p{display:none}</style>",
    '<iframe src="https://x"></iframe>',
    "<object data=x></object>",
    "<embed src=x>",
    '<form action="/x"><input></form>',
    "<input>",
    "<button>b</button>",
    "<textarea>t</textarea>",
    "<select><option>o</option></select>",
    '<base href="https://evil.example/">',
    '<meta http-equiv="refresh" content="0;url=https://evil.example">',
    '<link rel="stylesheet" href="https://evil.example/x.css">',
    "<template><b>x</b></template>",
    "<noscript>n</noscript>",
    "<math><mi>x</mi></math>",
    "<frameset><frame src=x></frameset>",
  ]) {
    assert.equal(render(`${html}`), "", html);
  }
  assert.equal(
    render("<p>a</p><script>alert(1)</script><p>b</p>"),
    "<p>a</p><p>b</p>",
  );
});

test("svg and its payloads are dropped", () => {
  assert.equal(
    render('<svg><a xlinkhref="javascript:alert(1)"><text>x</text></a></svg>'),
    "",
  );
  assert.equal(
    render(
      '<svg><a><animate attributeName="href" values="javascript:alert(1)"/><text>x</text></a></svg>',
    ),
    "",
  );
  assert.equal(render('<svg onload="alert(1)"></svg>ok'), "ok");
});

test("blocked elements nested in allowed ones are dropped", () => {
  assert.equal(
    render("<b><i><iframe src=x></iframe>t</i></b>"),
    "<b><i>t</i></b>",
  );
  assert.equal(render("<p><script>1</script>t</p>"), "<p>t</p>");
});

test("unknown tags unwrap to their children", () => {
  assert.equal(render('<font color="red">x <b>y</b></font>'), "x <b>y</b>");
  assert.equal(render("<center>c</center>"), "c");
});

test("only allowlisted attributes survive, and none that React treats specially", () => {
  assert.equal(
    render(
      '<img src="https://x/a.png" alt="a" onerror="alert(1)" class="c" id="i">',
    ),
    '<img src="https://x/a.png" alt="a"/>',
  );
  assert.equal(render('<p onclick="x()" ONMOUSEOVER="y()">t</p>'), "<p>t</p>");
  // used to crash the pane: React maps it to dangerouslySetInnerHTML
  assert.equal(render('<p dangerouslysetinnerhtml="x">a</p>'), "<p>a</p>");
  assert.equal(
    render('<p DangerouslySetInnerHTML="x" ref="r" key="k">a</p>'),
    "<p>a</p>",
  );
});

test("image sources: https and data:image only", () => {
  assert.equal(render('<img src="javascript:alert(1)">'), "");
  assert.equal(render('<img src="data:text/html;base64,AAAA">'), "");
  assert.equal(render('<img src="http://x/a.png">'), "");
  assert.equal(render('<img src="//x/a.png">'), "");
  assert.equal(render('<img src="data:image/svg+xml;base64,AAAA">'), "");
  assert.equal(
    render('<img src="data:image/png;base64,AAAA">'),
    '<img src="data:image/png;base64,AAAA"/>',
  );
});

test("style keeps only safe declarations", () => {
  assert.equal(
    render('<p style="background:url(javascript:alert(1))">x</p>'),
    "<p>x</p>",
  );
  assert.equal(
    render('<p style="position:fixed;top:0;color:blue">x</p>'),
    '<p style="color:blue">x</p>',
  );
  assert.equal(
    render('<p style="color:expression(alert(1))">x</p>'),
    "<p>x</p>",
  );
  // margin and padding could paint over the page: not allowed
  assert.equal(
    render('<p style="margin-left:-999px;padding:99px;color:red">x</p>'),
    '<p style="color:red">x</p>',
  );
  assert.equal(render('<p style="color:\\72 ed">x</p>'), "<p>x</p>");
});

test("cleanUrl and cleanStyle", () => {
  assert.equal(cleanUrl("href", "https://x"), "https://x");
  assert.equal(cleanUrl("href", "javascript:1"), null);
  assert.equal(cleanUrl("src", "https://x"), "https://x");
  assert.equal(cleanUrl("src", "mailto:a@b"), null);
  assert.equal(cleanStyle("color:red"), "color:red");
  assert.equal(cleanStyle("top:0"), null);
});

test("parseSafeHtml reports whether anything visible is left", () => {
  assert.equal(parseSafeHtml("<p>hi</p>").visible, true);
  assert.equal(parseSafeHtml('<img src="https://x/a.png">').visible, true);
  assert.equal(parseSafeHtml("<script>x</script>").visible, false);
  assert.equal(parseSafeHtml("<svg><circle/></svg>").visible, false);
  assert.equal(parseSafeHtml("<p> </p>").visible, false);
  assert.equal(parseSafeHtml("").visible, false);
});

test("img without a valid src is dropped", () => {
  assert.equal(render('<img alt="a">'), "");
  assert.equal(render('<img src="javascript:alert(1)" alt="a">'), "");
  assert.equal(
    render('<img src="https://x/a.png" alt="a">'),
    '<img src="https://x/a.png" alt="a"/>',
  );
});

test("CSS comments are stripped before the style checks", () => {
  assert.equal(cleanStyle("col/**/or:red"), "color:red");
  assert.equal(cleanStyle("color:red/* x */;top:0"), "color:red");
  assert.equal(cleanStyle("color:ur/**/l(x)"), null);
  assert.equal(cleanStyle("color:red /* unterminated"), "color:red");
});

test("an overlong style value is dropped", () => {
  assert.equal(cleanStyle("color:" + "a".repeat(600)), null);
});

test("deeply nested markup does not blow the stack", () => {
  const result = parseSafeHtml("<b>".repeat(1500) + "x");
  assert.equal(typeof result.visible, "boolean");
  assert.equal(parseSafeHtml("<p>x</p>".repeat(3000)).visible, true);
});

test("server and teacher HTML renders only through parseSafeHtml", () => {
  // Every app source file outside this module: no raw html-react-parser
  // and no dangerouslySetInnerHTML (an announcement or note is teacher HTML).
  const root = join(__dirname, "..");
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name))
        files.push(path);
    }
  };
  for (const dir of ["components", "pages", "hook", "react-query", "utils"])
    walk(join(root, dir));
  const raw = files
    .filter((file) => file !== join(__dirname, "safeHtml.ts"))
    .filter((file) =>
      /from ["']html-react-parser["']|dangerouslySetInnerHTML/.test(
        readFileSync(file, "utf8"),
      ),
    )
    .map((file) => relative(root, file).split(sep).join("/"));
  assert.deepEqual(raw, []);
});
