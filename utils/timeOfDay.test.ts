import test from "node:test";
import assert from "node:assert/strict";
import { dayPeriod, SCENE_PALETTES, SUN_POSITION } from "./timeOfDay";

const at = (h: number, m: number) => new Date(2026, 9, 28, h, m, 0);

test("dayPeriod boundaries", () => {
  assert.equal(dayPeriod(at(4, 59)), "night");
  assert.equal(dayPeriod(at(5, 0)), "morning");
  assert.equal(dayPeriod(at(10, 59)), "morning");
  assert.equal(dayPeriod(at(11, 0)), "noon");
  assert.equal(dayPeriod(at(12, 59)), "noon");
  assert.equal(dayPeriod(at(13, 0)), "afternoon");
  assert.equal(dayPeriod(at(17, 59)), "afternoon");
  assert.equal(dayPeriod(at(18, 0)), "night");
  assert.equal(dayPeriod(at(23, 59)), "night");
  assert.equal(dayPeriod(at(0, 0)), "night");
});

test("palettes and sun positions", () => {
  assert.equal(SCENE_PALETTES.night.window, "#FFD970");
  assert.equal(SCENE_PALETTES.morning.statusText, "dark");
  assert.equal(SCENE_PALETTES.noon.flag, "#FFCD1B");
  assert.equal(SCENE_PALETTES.night.flag, "#2C7CD1");
  assert.deepEqual(SUN_POSITION.afternoon, { x: 232, y: 160 });
});
