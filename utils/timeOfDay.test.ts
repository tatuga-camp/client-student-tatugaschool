import test from "node:test";
import assert from "node:assert/strict";
import { dayPeriod, lighten, SCENE_PALETTES, SUN_POSITION } from "./timeOfDay";

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

test("lighten mixes toward white: 25% lighter header-band sky", () => {
  assert.equal(lighten("#2F86F0", 0.25), "#63A4F4");
  assert.equal(lighten("#9ccbff", 0.25), "#B5D8FF");
  assert.equal(lighten("#000000", 0.5), "#808080");
  assert.equal(lighten("#FFFFFF", 0.25), "#FFFFFF");
  assert.equal(lighten("#2F86F0", 0), "#2F86F0");
});
