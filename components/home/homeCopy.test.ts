import assert from "node:assert/strict";
import { test } from "node:test";
import { homeLanguage } from "../../data/languages/home";

test("home copy reads naturally in both languages", () => {
  assert.equal(homeLanguage.doneOf("en", 3, 5), "3 / 5 done");
  assert.equal(homeLanguage.doneOf("th", 3, 5), "เสร็จ 3 / 5");
  assert.equal(homeLanguage.assignmentsLeft("en", 1), "1 assignment left");
  assert.equal(homeLanguage.assignmentsLeft("en", 2), "2 assignments left");
  assert.equal(homeLanguage.assignmentsLeft("th", 2), "เหลืองาน 2 ชิ้น");
  assert.equal(
    homeLanguage.greeting("th", "morning", "สมชาย"),
    "อรุณสวัสดิ์ สมชาย!",
  );
});
