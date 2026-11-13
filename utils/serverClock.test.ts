import { test } from "node:test";
import assert from "node:assert/strict";

// The module only records on the client; give it a window to find.
(globalThis as any).window = {
  atob: (s: string) => Buffer.from(s, "base64").toString(),
};

const tokenIssuedAt = (iat: number) =>
  `h.${Buffer.from(JSON.stringify({ iat, exp: iat + 300 })).toString("base64")}.s`;

test("a device clock running ahead is corrected to the server's", async () => {
  const { recordServerClock, serverNowSeconds } = await import("./serverClock");
  const device = Math.floor(Date.now() / 1000);
  // The server issued this token "now", three hours behind the device.
  const serverNow = device - 3 * 60 * 60;
  recordServerClock(tokenIssuedAt(serverNow));
  assert.ok(Math.abs(serverNowSeconds() - serverNow) <= 1);
  // So the 5-minute token is not yet expired by the server's clock.
  assert.ok(serverNowSeconds() < serverNow + 300);
});

test("a token without iat leaves the clock as it was", async () => {
  const { recordServerClock, serverNowSeconds } = await import("./serverClock");
  const before = serverNowSeconds();
  recordServerClock("h.e30=.s");
  recordServerClock("garbage");
  assert.ok(Math.abs(serverNowSeconds() - before) <= 1);
});
