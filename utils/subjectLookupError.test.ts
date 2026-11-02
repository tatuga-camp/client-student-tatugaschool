import { test } from "node:test";
import assert from "node:assert/strict";
import { errorPropsFromLookup } from "./subjectLookupError";

test("errorPropsFromLookup: an archived subject keeps its code", () => {
  assert.deepEqual(
    errorPropsFromLookup({
      statusCode: 403,
      message: "Subject is archived. Students cannot open it.",
      code: "SUBJECT_ARCHIVED",
      error: "Forbidden",
    }),
    {
      statusCode: 403,
      message: "Subject is archived. Students cannot open it.",
      code: "SUBJECT_ARCHIVED",
    },
  );
});

test("errorPropsFromLookup: a 400 is a class that doesn't exist", () => {
  assert.deepEqual(errorPropsFromLookup({ statusCode: 400, message: "bad" }), {
    statusCode: 404,
    message: null,
  });
});

test("errorPropsFromLookup: other HTTP errors keep status and message, no code key", () => {
  const props = errorPropsFromLookup({ statusCode: 500, message: "boom" });
  assert.deepEqual(props, { statusCode: 500, message: "boom" });
  assert.equal("code" in props, false);
});

test("errorPropsFromLookup: a network failure has no status or message", () => {
  assert.deepEqual(errorPropsFromLookup({ message: "Network error" }), {
    statusCode: null,
    message: null,
  });
  assert.deepEqual(errorPropsFromLookup(undefined), {
    statusCode: null,
    message: null,
  });
});
