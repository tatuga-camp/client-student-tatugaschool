import { test } from "node:test";
import assert from "node:assert/strict";
import { timeAgo, timeLeft } from "./date";

const HOUR = 60 * 60 * 1000;

test("timeLeft defaults to English units", () => {
  const target = new Date(Date.now() + 2 * 24 * HOUR + HOUR).toISOString();
  assert.equal(timeLeft({ targetTime: target }), "2 days");
});

test("timeLeft renders Thai units when asked", () => {
  const target = new Date(Date.now() + 2 * 24 * HOUR + HOUR).toISOString();
  assert.equal(timeLeft({ targetTime: target, language: "th" }), "2 วัน");
});

test("timeLeft singular English unit", () => {
  const target = new Date(Date.now() + HOUR + 60 * 1000).toISOString();
  assert.equal(timeLeft({ targetTime: target, language: "en" }), "1 hour");
});

test("timeLeft past target is localized", () => {
  const past = new Date(Date.now() - HOUR).toISOString();
  assert.equal(timeLeft({ targetTime: past }), "Time is up!");
  assert.equal(timeLeft({ targetTime: past, language: "th" }), "หมดเวลาแล้ว");
});

test("timeAgo renders Thai units and the just-now case", () => {
  const past = new Date(Date.now() - 3 * HOUR - 60 * 1000).toISOString();
  assert.equal(timeAgo({ pastTime: past }), "3 hours");
  assert.equal(timeAgo({ pastTime: past, language: "th" }), "3 ชั่วโมง");
  const future = new Date(Date.now() + HOUR).toISOString();
  assert.equal(timeAgo({ pastTime: future, language: "th" }), "เมื่อสักครู่");
});
