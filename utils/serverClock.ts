import { safeGet, safeSet } from "./safeStorage";

/**
 * The server's clock, as seen from a device whose own clock may be wrong.
 *
 * Token expiry is checked on the device, but `exp` is written by the server.
 * On a PC whose clock runs ahead, a token minutes old already looks expired,
 * so the app drops it and the student is told they don't exist. A token's
 * `iat` is the server's time at the moment we received it, which gives the
 * difference between the two clocks.
 */
const OFFSET_KEY = "server_clock_offset";

// Seconds to add to the device clock to get the server's. null = not read yet.
let offsetSeconds: number | null = null;

const deviceSeconds = () => Math.floor(Date.now() / 1000);

function readIssuedAt(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json =
      typeof window !== "undefined"
        ? window.atob(payload)
        : Buffer.from(payload, "base64").toString();
    const iat = JSON.parse(json).iat;
    return typeof iat === "number" ? iat : null;
  } catch {
    return null;
  }
}

/** Call with a token the server issued just now (sign-in or refresh). */
export function recordServerClock(freshToken: string): void {
  if (typeof window === "undefined") return;
  const iat = readIssuedAt(freshToken);
  if (iat === null) return;
  offsetSeconds = iat - deviceSeconds();
  safeSet(OFFSET_KEY, String(offsetSeconds));
}

/** Current time in seconds by the server's clock, as best we know it. */
export function serverNowSeconds(): number {
  if (offsetSeconds === null && typeof window !== "undefined") {
    const stored = Number(safeGet(OFFSET_KEY));
    offsetSeconds = Number.isFinite(stored) ? stored : 0;
  }
  return deviceSeconds() + (offsetSeconds ?? 0);
}
