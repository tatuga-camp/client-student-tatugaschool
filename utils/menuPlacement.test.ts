import { test } from "node:test";
import assert from "node:assert/strict";
import { Box, placeMenu, visibleScreen } from "./menuPlacement";

// The phone screen at 390 x 844 and the Delete / Rename menu (150 x 146).
const SCREEN: Box = { left: 0, top: 0, right: 390, bottom: 844 };
const W = 150;
const H = 146;

/** The menu's box in viewport pixels. */
function menuBox(container: Box, button: Box): Box {
  const { left, top } = placeMenu({
    button,
    container,
    screen: SCREEN,
    width: W,
    height: H,
  });
  const l = container.left + left;
  const t = container.top + top;
  return { left: l, top: t, right: l + W, bottom: t + H };
}

const overlaps = (a: Box, b: Box) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

const inside = (a: Box, b: Box) =>
  a.left >= b.left &&
  a.top >= b.top &&
  a.right <= b.right &&
  a.bottom <= b.bottom;

test("short sheet: the menu opens above ⋯, past the panel, never over ⋯", () => {
  // Turned-in Your work with one item: panel 664-844, ⋯ at 330,764-374,808.
  const panel: Box = { left: 0, top: 664, right: 390, bottom: 844 };
  const dots: Box = { left: 330, top: 764, right: 374, bottom: 808 };
  const menu = menuBox(panel, dots);
  assert.equal(overlaps(menu, dots), false);
  assert.equal(menu.bottom, dots.top - 4);
  assert.ok(menu.top < panel.top, "extends above the panel");
  assert.ok(inside(menu, SCREEN));
});

test("room below: the menu opens under ⋯, right-aligned with it", () => {
  const panel: Box = { left: 0, top: 200, right: 390, bottom: 844 };
  const dots: Box = { left: 330, top: 300, right: 374, bottom: 344 };
  const menu = menuBox(panel, dots);
  assert.deepEqual(menu, { left: 224, top: 348, right: 374, bottom: 494 });
});

test("⋯ near the screen's left edge: the menu stays on screen", () => {
  const panel: Box = { left: 0, top: 0, right: 390, bottom: 844 };
  const dots: Box = { left: 4, top: 300, right: 48, bottom: 344 };
  const menu = menuBox(panel, dots);
  assert.equal(menu.left, 8);
  assert.equal(overlaps(menu, dots), false);
});

test("neither side fits: the roomier side, still never over ⋯", () => {
  const screen: Box = { left: 0, top: 0, right: 390, bottom: 300 };
  const dots: Box = { left: 330, top: 120, right: 374, bottom: 164 };
  for (const button of [dots, { ...dots, top: 100, bottom: 144 }]) {
    const pos = placeMenu({
      button,
      container: screen,
      screen,
      width: W,
      height: H,
    });
    const menu = {
      left: pos.left,
      top: pos.top,
      right: pos.left + W,
      bottom: pos.top + H,
    };
    assert.equal(overlaps(menu, button), false);
  }
});

test("a framed screen: coordinates are relative to the container", () => {
  // 1280 frame: screen 445,24-835,776; panel 562-776; ⋯ 775,682-819,726.
  const screen: Box = { left: 445, top: 24, right: 835, bottom: 776 };
  const panel: Box = { left: 445, top: 562, right: 835, bottom: 776 };
  const dots: Box = { left: 775, top: 682, right: 819, bottom: 726 };
  const pos = placeMenu({
    button: dots,
    container: panel,
    screen,
    width: W,
    height: H,
  });
  const menu = {
    left: panel.left + pos.left,
    top: panel.top + pos.top,
    right: panel.left + pos.left + W,
    bottom: panel.top + pos.top + H,
  };
  assert.equal(overlaps(menu, dots), false);
  assert.ok(inside(menu, screen));
  assert.equal(menu.right, dots.right);
});

test("visibleScreen: the on-screen keyboard cuts the screen's bottom", () => {
  // 390 x 844 phone, keyboard up: the visual viewport is 0-480.
  assert.deepEqual(visibleScreen(SCREEN, { offsetTop: 0, height: 480 }), {
    ...SCREEN,
    bottom: 480,
  });
  // Scrolled visual viewport (iOS with the keyboard up): 120-600.
  assert.deepEqual(visibleScreen(SCREEN, { offsetTop: 120, height: 480 }), {
    ...SCREEN,
    top: 120,
    bottom: 600,
  });
  // No keyboard, or no visualViewport: the screen itself.
  assert.deepEqual(
    visibleScreen(SCREEN, { offsetTop: 0, height: 844 }),
    SCREEN,
  );
  assert.deepEqual(visibleScreen(SCREEN, undefined), SCREEN);
  // A framed screen inside a taller window: the window cuts nothing.
  const framed: Box = { left: 445, top: 24, right: 835, bottom: 776 };
  assert.deepEqual(
    visibleScreen(framed, { offsetTop: 0, height: 800 }),
    framed,
  );
});

test("keyboard up: a ⋯ near the keyboard opens its menu above it", () => {
  // Rename field focused in a tall sheet; keyboard covers 480-844.
  const panel: Box = { left: 0, top: 200, right: 390, bottom: 844 };
  const dots: Box = { left: 330, top: 380, right: 374, bottom: 424 };
  const pos = placeMenu({
    button: dots,
    container: panel,
    screen: visibleScreen(SCREEN, { offsetTop: 0, height: 480 }),
    width: W,
    height: H,
  });
  const menu = {
    left: panel.left + pos.left,
    top: panel.top + pos.top,
    right: panel.left + pos.left + W,
    bottom: panel.top + pos.top + H,
  };
  assert.equal(menu.bottom, dots.top - 4);
  assert.ok(menu.bottom <= 480, "clear of the keyboard");
  assert.equal(overlaps(menu, dots), false);
});

test("visibleScreen keeps every side of a DOMRect (its fields are getters)", () => {
  // Like a DOMRect: the fields live on the prototype, so a spread drops them.
  class Rect {
    #box: Box;
    constructor(box: Box) {
      this.#box = box;
    }
    get left() {
      return this.#box.left;
    }
    get top() {
      return this.#box.top;
    }
    get right() {
      return this.#box.right;
    }
    get bottom() {
      return this.#box.bottom;
    }
  }
  const framed = new Rect({ left: 445, top: 24, right: 835, bottom: 776 });
  assert.deepEqual({ ...framed }, {});
  assert.deepEqual(visibleScreen(framed, { offsetTop: 0, height: 500 }), {
    left: 445,
    top: 24,
    right: 835,
    bottom: 500,
  });
  // And the menu it places stays beside its ⋯, not at the screen's left edge.
  const dots: Box = { left: 760, top: 300, right: 804, bottom: 344 };
  const pos = placeMenu({
    button: dots,
    container: framed,
    screen: visibleScreen(framed, { offsetTop: 0, height: 800 }),
    width: W,
    height: H,
  });
  assert.equal(framed.left + pos.left + W, dots.right);
});
