import test from "node:test";
import assert from "node:assert/strict";
import {
  dayPeriod,
  lighten,
  SCENE_PALETTES,
  sunDisc,
  SUN_POSITION,
  WELCOME_SUN_POSITION,
} from "./timeOfDay";

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

// The phone screen at 390 x 844: a 47 px status bar (the frame's too).
const STATUS_BAR = 47;
const HOME = { width: 390, height: 330 };
const WELCOME = { width: 390, height: 300 };

test("sunDisc: where a scene position lands on screen (xMidYMax slice)", () => {
  // 390 wide: x1.393, the top 93 units cropped on Home.
  const d = sunDisc({ x: 232, y: 160 }, HOME);
  assert.deepEqual([d.left, d.top, d.right, d.bottom], [297, 67, 349, 119]);
});

test("noon and night: the disc sits fully below the status bar", () => {
  for (const period of ["noon", "night"] as const) {
    const home = sunDisc(SUN_POSITION[period], HOME);
    assert.ok(home.top >= STATUS_BAR, `Home ${period} top ${home.top}`);
    // Beside the bell (x 336+) and above the greeting bubble (y 108+).
    assert.ok(home.right <= 336 && home.bottom <= 108, `Home ${period}`);
    const welcome = sunDisc(WELCOME_SUN_POSITION[period], WELCOME);
    assert.ok(
      welcome.top >= STATUS_BAR,
      `welcome ${period} top ${welcome.top}`,
    );
    // Between the badge (x <= 156) and the TH/EN pill (x >= 284).
    assert.ok(welcome.left >= 156 && welcome.right <= 284, `welcome ${period}`);
  }
});

test("morning and afternoon stay where they were, on both scenes", () => {
  assert.deepEqual(SUN_POSITION.morning, { x: 52, y: 150 });
  assert.deepEqual(WELCOME_SUN_POSITION.morning, SUN_POSITION.morning);
  assert.deepEqual(WELCOME_SUN_POSITION.afternoon, SUN_POSITION.afternoon);
});
