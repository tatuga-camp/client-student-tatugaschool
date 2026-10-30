import test from "node:test";
import assert from "node:assert/strict";
import { consumeAnnouncementLink, flashTiming } from "./deepLink";

test("consumeAnnouncementLink drops announcement_id and pins the Classwork tab", () => {
  assert.deepEqual(
    consumeAnnouncementLink({ subjectId: "s1", announcement_id: "a1" }),
    { subjectId: "s1", tab: "classwork" },
  );
});

test("consumeAnnouncementLink keeps an explicit tab and other params", () => {
  assert.deepEqual(
    consumeAnnouncementLink({
      subjectId: "s1",
      tab: "home",
      announcement_id: "a1",
      x: "1",
    }),
    { subjectId: "s1", tab: "classwork", x: "1" },
  );
});

test("consumeAnnouncementLink is null when there is no link to consume", () => {
  assert.equal(consumeAnnouncementLink({ subjectId: "s1" }), null);
  assert.equal(
    consumeAnnouncementLink({ subjectId: "s1", announcement_id: "" }),
    null,
  );
});

test("flashTiming waits for a smooth scroll and skips it under reduced motion", () => {
  assert.deepEqual(flashTiming(false), {
    behavior: "smooth",
    startDelay: 450,
    holdMs: 2500,
  });
  assert.deepEqual(flashTiming(true), {
    behavior: "auto",
    startDelay: 0,
    holdMs: 2500,
  });
});
