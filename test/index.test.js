import test from "node:test";
import assert from "node:assert/strict";
import { runSuite, renderText } from "../src/index.js";

test("evaluates deterministic prompt expectations", () => {
  const results = runSuite({ cases: [{ id: "one", output: "hello world", expect: [{ contains: "hello" }, { notContains: "error" }] }] });
  assert.equal(results[0].ok, true);
  assert.match(renderText(results), /1\/1/);
});
