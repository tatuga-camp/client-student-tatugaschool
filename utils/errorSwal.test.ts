import { test } from "node:test";
import assert from "node:assert/strict";
import { errorSwalContent } from "./errorSwal";

test("passes through a well-formed ErrorMessages object", () => {
  assert.deepEqual(
    errorSwalContent({ message: "Not found", error: "Bad Request", statusCode: 404 }),
    { title: "Bad Request", text: "Not found", footer: "Code Error: 404" },
  );
});

test("uses a raw string rejection as the text", () => {
  assert.deepEqual(errorSwalContent("<?xml?><Error/>"), {
    title: "Something Went Wrong",
    text: "<?xml?><Error/>",
    footer: "",
  });
});

test("uses an Error instance's message", () => {
  assert.deepEqual(errorSwalContent(new Error("Network Error")), {
    title: "Something Went Wrong",
    text: "Network Error",
    footer: "",
  });
});

test("survives undefined and null", () => {
  const fallback = {
    title: "Something Went Wrong",
    text: "Please try again.",
    footer: "",
  };
  assert.deepEqual(errorSwalContent(undefined), fallback);
  assert.deepEqual(errorSwalContent(null), fallback);
});

test("joins a NestJS-style message array like the old toString() did", () => {
  assert.equal(
    errorSwalContent({ message: ["a is required", "b is invalid"] }).text,
    "a is required,b is invalid",
  );
});

test("omits the footer when statusCode is missing", () => {
  assert.equal(errorSwalContent({ message: "x", error: "y" }).footer, "");
});
