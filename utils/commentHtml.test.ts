import test from "node:test";
import assert from "node:assert/strict";
import { commentDraftIsEmpty, plainTextToCommentHtml } from "./commentHtml";

test("plainTextToCommentHtml escapes markup and keeps line breaks", () => {
  assert.equal(plainTextToCommentHtml("hi"), "<p>hi</p>");
  assert.equal(
    plainTextToCommentHtml('1 < 2 & "3" > <b>x</b>'),
    "<p>1 &lt; 2 &amp; &quot;3&quot; &gt; &lt;b&gt;x&lt;/b&gt;</p>",
  );
  assert.equal(plainTextToCommentHtml("a\nb\r\nc"), "<p>a<br>b<br>c</p>");
});

test("plainTextToCommentHtml trims the ends", () => {
  assert.equal(plainTextToCommentHtml("  \n hi \n "), "<p>hi</p>");
});

test("commentDraftIsEmpty is true for blank drafts", () => {
  assert.equal(commentDraftIsEmpty(""), true);
  assert.equal(commentDraftIsEmpty(" \n\t "), true);
  assert.equal(commentDraftIsEmpty("a"), false);
});
