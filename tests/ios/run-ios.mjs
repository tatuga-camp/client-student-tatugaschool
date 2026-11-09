// Real-iPhone smoke test for the student app on BrowserStack Automate:
// join a class by code, pick a student, land on the subject page, and
// (optionally) open an assignment's Your work sheet. Every iOS major from 14
// up runs once, on an iPhone 12 or newer.
//
// What it guards: the app must HYDRATE on every iOS we support. A bundle an
// older Safari can't parse leaves the server-rendered page looking right with
// no button working (Nov 2026: iOS 15.6 couldn't pick a student).
//
// Usage (see tests/ios/README.md):
//   BROWSERSTACK_USERNAME=… BROWSERSTACK_ACCESS_KEY=… \
//   BASE_URL=https://… TEST_SUBJECT_CODE=60ccf5 TEST_STUDENT=Emily \
//   npm run test:ios
//
// Optional env:
//   TEST_SUBJECT_ID + TEST_ASSIGNMENT_ID  also open that assignment and its
//                                         Your work sheet
//   IOS=15,16                             only these iOS majors
//   PARALLEL=2                            sessions at once (your plan's limit)
//   BROWSERSTACK_LOCAL=true               BASE_URL is reached through a running
//                                         BrowserStack Local binary
//   BUILD_NAME=…                          dashboard build name

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** One device per iOS major; iPhone 12 or newer (BrowserStack's list). */
export const MATRIX = [
  { ios: "14", device: "iPhone 12" },
  { ios: "15", device: "iPhone 13" },
  { ios: "16", device: "iPhone 13" },
  { ios: "17", device: "iPhone 12" },
  { ios: "18", device: "iPhone 16" },
  { ios: "26", device: "iPhone 17" },
  { ios: "27", device: "iPhone 15" },
];

const HUB = "https://hub-cloud.browserstack.com/wd/hub";
const ELEMENT = "element-6066-11e4-a52e-4f735466cecf";
const ARTIFACTS = join(process.cwd(), "tests", "ios", "artifacts");

const env = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    console.error(`Missing ${name} (see tests/ios/README.md).`);
    process.exit(2);
  }
  return value;
};

const USER = env("BROWSERSTACK_USERNAME");
const KEY = env("BROWSERSTACK_ACCESS_KEY");
const BASE_URL = env("BASE_URL").replace(/\/+$/, "");
const SUBJECT_CODE = env("TEST_SUBJECT_CODE");
const STUDENT = env("TEST_STUDENT");
const SUBJECT_ID = process.env.TEST_SUBJECT_ID;
const ASSIGNMENT_ID = process.env.TEST_ASSIGNMENT_ID;
const PARALLEL = Number(process.env.PARALLEL ?? 2);
const LOCAL = process.env.BROWSERSTACK_LOCAL === "true";
const BUILD =
  process.env.BUILD_NAME ??
  `student-ios-smoke ${new Date().toISOString().slice(0, 16)}`;
const ONLY = process.env.IOS?.split(",").map((s) => s.trim());

const AUTH = "Basic " + Buffer.from(`${USER}:${KEY}`).toString("base64");

async function wd(method, path, body) {
  const res = await fetch(HUB + path, {
    method,
    headers: { Authorization: AUTH, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = json?.value?.message ?? res.statusText;
    throw new Error(`${method} ${path.replace(/\/session\/\w+/, "")}: ${message}`);
  }
  return json.value;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Polls `check` until it returns something truthy, or fails with `what`. */
async function waitFor(what, check, timeoutMs = 30_000) {
  const end = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < end) {
    try {
      const value = await check();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await sleep(750);
  }
  throw new Error(
    `Timed out waiting for ${what}` +
      (lastError ? ` (last error: ${lastError.message})` : ""),
  );
}

/** A browser session on one iPhone, with the few commands the flow needs. */
class Session {
  constructor(id) {
    this.id = id;
  }

  static async start({ ios, device }) {
    const value = await wd("POST", "/session", {
      capabilities: {
        alwaysMatch: {
          browserName: "iphone",
          "bstack:options": {
            deviceName: device,
            osVersion: ios,
            realMobile: "true",
            local: LOCAL ? "true" : "false",
            projectName: "Tatuga student app",
            buildName: BUILD,
            sessionName: `join → pick → subject · iOS ${ios} ${device}`,
            idleTimeout: 120,
            consoleLogs: "errors",
          },
        },
      },
    });
    return new Session(value.sessionId);
  }

  cmd(method, path = "", body) {
    return wd(method, `/session/${this.id}${path}`, body);
  }

  /** Navigates, retrying when the device is still on its start page. */
  async open(url) {
    for (let attempt = 0; attempt < 3; attempt++) {
      await this.cmd("POST", "/url", { url });
      const now = await this.cmd("GET", "/url");
      if (String(now).startsWith(BASE_URL)) return;
      await sleep(1500);
    }
    throw new Error(`The browser would not open ${url}`);
  }

  // ES5 only: these scripts run on the oldest iOS in the matrix.
  run(script, args = []) {
    return this.cmd("POST", "/execute/sync", { script, args });
  }

  async find(using, value) {
    const els = await this.cmd("POST", "/elements", { using, value });
    return els.length > 0 ? els[0][ELEMENT] : null;
  }

  click(id) {
    return this.cmd("POST", `/element/${id}/click`, {});
  }

  type(id, text) {
    return this.cmd("POST", `/element/${id}/value`, { text });
  }

  async screenshot(name) {
    const base64 = await this.cmd("GET", "/screenshot");
    mkdirSync(ARTIFACTS, { recursive: true });
    const file = join(ARTIFACTS, `${name}.png`);
    writeFileSync(file, Buffer.from(base64, "base64"));
    return file;
  }

  async finish(passed, reason) {
    const status = JSON.stringify({
      action: "setSessionStatus",
      arguments: { status: passed ? "passed" : "failed", reason },
    });
    await this.run(`browserstack_executor: ${status}`).catch(() => {});
    await this.cmd("DELETE").catch(() => {});
  }

  /** The dashboard link for this session. */
  async link() {
    const res = await fetch(
      `https://api.browserstack.com/automate/sessions/${this.id}.json`,
      { headers: { Authorization: AUTH } },
    );
    const json = await res.json().catch(() => null);
    return json?.automation_session?.browser_url ?? null;
  }
}

/** True once React has hydrated the element `selector` finds. */
const HYDRATED = `
  var el = document.querySelector(arguments[0]);
  if (!el) return false;
  for (var key in el) if (key.indexOf('__reactProps') === 0) return true;
  return false;`;

/** Collects page errors from here on (installed after each navigation). */
const TRAP_ERRORS = `
  window.__smokeErrors = window.__smokeErrors || [];
  if (!window.__smokeTrap) {
    window.__smokeTrap = true;
    window.addEventListener('error', function (e) {
      window.__smokeErrors.push(String(e.message));
    });
    window.addEventListener('unhandledrejection', function (e) {
      window.__smokeErrors.push('unhandled rejection: ' + String(e.reason));
    });
  }`;

async function flow(s, steps) {
  const step = async (name, fn) => {
    steps.push(name);
    await fn();
  };

  await step("welcome page hydrates", async () => {
    await s.open(`${BASE_URL}/welcome`);
    await waitFor("the Join button to hydrate (React never started?)", () =>
      s.run(HYDRATED, ["form button[type=submit]"]),
    );
    await s.run(TRAP_ERRORS);
  });

  await step("type the class code and join", async () => {
    const input = await waitFor("the code input", () =>
      s.find("css selector", "form input"),
    );
    await s.type(input, SUBJECT_CODE);
    const join = await s.find("css selector", "form button[type=submit]");
    await s.click(join);
  });

  const studentButton = `//li/button[contains(normalize-space(.), ${JSON.stringify(STUDENT)})]`;
  await step(`pick "${STUDENT}"`, async () => {
    const id = await waitFor(`the "${STUDENT}" card`, () =>
      s.find("xpath", studentButton),
    );
    await waitFor("the student cards to hydrate", () =>
      s.run(HYDRATED, ["li button"]),
    );
    await s.click(id);
  });

  await step("land on the subject page", async () => {
    await waitFor(
      "the subject page (the card tap did nothing?)",
      async () => String(await s.cmd("GET", "/url")).includes("/subject/"),
      45_000,
    );
    await waitFor("the subject page to hydrate", () =>
      s.run(HYDRATED, ["button"]),
    );
  });

  if (SUBJECT_ID && ASSIGNMENT_ID) {
    await step("open the assignment and its Your work sheet", async () => {
      await s.open(
        `${BASE_URL}/subject/${SUBJECT_ID}/assignment/${ASSIGNMENT_ID}`,
      );
      await s.run(TRAP_ERRORS);
      // The peek's first button expands it whatever state the work is in:
      // "Add work" while open, the whole peek once turned in or reviewed.
      const peekButton = "[role=dialog][aria-modal=false] button";
      const opener = await waitFor("the Your work peek", () =>
        s.find("css selector", peekButton),
      );
      await waitFor("the Your work peek to hydrate", () =>
        s.run(HYDRATED, [peekButton]),
      );
      await s.click(opener);
      // Expanded, the sheet becomes modal.
      await waitFor("the Your work sheet to open", () =>
        s.find("css selector", "[role=dialog][aria-modal=true]"),
      );
    });
  }

  const errors = (await s.run("return window.__smokeErrors || []")) ?? [];
  if (errors.length > 0)
    throw new Error(`Page errors: ${errors.slice(0, 3).join(" | ")}`);
}

async function runOne(target) {
  const label = `iOS ${target.ios} · ${target.device}`;
  const steps = [];
  let s;
  try {
    s = await Session.start(target);
    await flow(s, steps);
    const link = await s.link();
    await s.finish(true, "join → pick → subject passed");
    return { label, ok: true, link };
  } catch (error) {
    const reason = `${steps.at(-1) ?? "start session"}: ${error.message}`;
    let shot = null;
    let link = null;
    if (s) {
      shot = await s
        .screenshot(`ios${target.ios}-${target.device.replace(/\s+/g, "")}`)
        .catch(() => null);
      link = await s.link().catch(() => null);
      await s.finish(false, reason.slice(0, 250));
    }
    return { label, ok: false, reason, shot, link };
  }
}

async function main() {
  const targets = ONLY ? MATRIX.filter((t) => ONLY.includes(t.ios)) : MATRIX;
  if (targets.length === 0) {
    console.error(`No device for IOS=${process.env.IOS}.`);
    process.exit(2);
  }
  console.log(
    `${targets.length} iPhone(s), ${PARALLEL} at a time → ${BASE_URL}` +
      (LOCAL ? " (BrowserStack Local)" : ""),
  );

  const results = [];
  const queue = [...targets];
  await Promise.all(
    Array.from({ length: Math.min(PARALLEL, queue.length) }, async () => {
      while (queue.length > 0) {
        const target = queue.shift();
        const result = await runOne(target);
        results.push(result);
        console.log(
          `${result.ok ? "✓" : "✗"} ${result.label}` +
            (result.ok ? "" : `\n    ${result.reason}`) +
            (result.shot ? `\n    screenshot: ${result.shot}` : "") +
            (result.link ? `\n    ${result.link}` : ""),
        );
      }
    }),
  );

  const failed = results.filter((r) => !r.ok);
  console.log(
    `\n${results.length - failed.length}/${results.length} passed` +
      (failed.length ? `; failed: ${failed.map((r) => r.label).join(", ")}` : ""),
  );
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
