import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeBlurhashToCanvas } from "./blurHash";
import { defaultBlurHash, defaultCanvas } from "../data";

// Minimal browser stand-ins: the decoder only needs `window` to exist and
// document.createElement("canvas") to hand back a 2D context.
let canvasesCreated = 0;
let contextAvailable = true;

(globalThis as any).window = {};
(globalThis as any).document = {
  createElement: () => {
    canvasesCreated++;
    return {
      width: 0,
      height: 0,
      getContext: () =>
        contextAvailable
          ? {
              createImageData: (w: number, h: number) => ({
                data: new Uint8ClampedArray(w * h * 4),
              }),
              putImageData: () => {},
            }
          : null,
      toDataURL: () => `data:image/png;base64,canvas-${canvasesCreated}`,
    };
  },
};

test("decodeBlurhashToCanvas falls back to the default image for an empty blurhash", () => {
  assert.equal(decodeBlurhashToCanvas(""), defaultCanvas);
});

test("decodeBlurhashToCanvas falls back to the default image for a malformed blurhash", () => {
  assert.equal(decodeBlurhashToCanvas("not-a-blurhash"), defaultCanvas);
});

test("decodeBlurhashToCanvas falls back when the browser gives no 2D context", () => {
  contextAvailable = false;
  try {
    assert.equal(decodeBlurhashToCanvas(defaultBlurHash, 16, 16), defaultCanvas);
  } finally {
    contextAvailable = true;
  }
});

test("decodeBlurhashToCanvas reuses the decoded image for the same blurhash", () => {
  const before = canvasesCreated;
  const first = decodeBlurhashToCanvas(defaultBlurHash, 24, 24);
  const second = decodeBlurhashToCanvas(defaultBlurHash, 24, 24);
  assert.equal(second, first);
  assert.notEqual(first, defaultCanvas);
  assert.equal(canvasesCreated - before, 1);
});
