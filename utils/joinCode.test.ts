import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanCodeInput,
  joinCodeForLookup,
  joinCodeFromQuery,
  normalizeJoinCode,
} from "./joinCode";

test("normalizeJoinCode keeps A-Z/0-9, uppercases and caps at 6", () => {
  assert.equal(normalizeJoinCode(" ma-th 21x"), "MATH21");
  assert.equal(normalizeJoinCode("ab"), "AB");
  assert.equal(normalizeJoinCode("123 456"), "123456");
});

test("normalizeJoinCode takes the code out of a pasted teacher link", () => {
  assert.equal(
    normalizeJoinCode("https://student.tatugaschool.com/?subject_code=fe5235"),
    "FE5235",
  );
  assert.equal(
    normalizeJoinCode(
      "https://student.tatugaschool.com/?announcement_id=a1&subject_code=fe5235&x=1#top",
    ),
    "FE5235",
  );
  assert.equal(normalizeJoinCode("Join: /?subject_code=ab%2012"), "AB12");
  // Plain text is unchanged.
  assert.equal(normalizeJoinCode("subject fe5235"), "SUBJEC");
});

test("joinCodeForLookup lowercases the code the server stores in hex", () => {
  assert.equal(joinCodeForLookup("FE5235"), "fe5235");
});

test("cleanCodeInput: alnum codes are normalized, digits keep digits only", () => {
  assert.equal(cleanCodeInput(" ma-th 21x", "alnum"), "MATH21");
  assert.equal(cleanCodeInput("12 a3-45 678", "digits"), "123456");
  assert.equal(cleanCodeInput("abc", "digits"), "");
});

test("joinCodeFromQuery: only a 6-character code goes to the server", () => {
  assert.equal(joinCodeFromQuery("FE5235"), "fe5235");
  assert.equal(joinCodeFromQuery(" fe5235 "), "fe5235");
  assert.equal(joinCodeFromQuery("ZZZZZZ"), "zzzzzz");
  assert.equal(joinCodeFromQuery("WRONG"), null);
  assert.equal(joinCodeFromQuery("fe5235x"), null);
  assert.equal(joinCodeFromQuery("fe-523"), null);
  assert.equal(joinCodeFromQuery(""), null);
  assert.equal(joinCodeFromQuery(["fe5235", "fe5235"]), null);
  assert.equal(joinCodeFromQuery(undefined), null);
});
