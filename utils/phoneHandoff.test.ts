import test from "node:test";
import assert from "node:assert/strict";
import { phoneHandoffUrl } from "./phoneHandoff";
import { isFrameExcluded } from "./frameRoutes";

const origin = "https://student.tatugaschool.com";

test("phoneHandoffUrl targets the welcome/home page, the subject join link, or /welcome", () => {
  assert.equal(phoneHandoffUrl({ origin, pathname: "/welcome", asPath: "/welcome" }), `${origin}/welcome`);
  assert.equal(phoneHandoffUrl({ origin, pathname: "/", asPath: "/?subject_code=MATH21" }), `${origin}/?subject_code=MATH21`);
  assert.equal(
    phoneHandoffUrl({ origin, pathname: "/subject/[subjectId]", asPath: "/subject/abc?tab=me", subjectCode: "MA TH" }),
    `${origin}/?subject_code=MA%20TH`,
  );
  assert.equal(
    phoneHandoffUrl({ origin, pathname: "/subject/[subjectId]", asPath: "/subject/abc", subjectCode: null }),
    `${origin}/welcome`,
  );
});

test("isFrameExcluded skips the big-screen routes only", () => {
  assert.equal(isFrameExcluded("/word-cloud/results/[token]"), true);
  assert.equal(isFrameExcluded("/progress/[token]"), true);
  assert.equal(isFrameExcluded("/word-cloud/[wordCloudId]"), false);
  assert.equal(isFrameExcluded("/"), false);
});
