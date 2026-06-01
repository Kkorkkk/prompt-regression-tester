import test from "node:test";
import assert from "node:assert/strict";
import { renderHtml, runSuite, runSuiteWithAdapter, renderText } from "../src/index.js";

test("evaluates deterministic prompt expectations", () => {
  const results = runSuite({ cases: [{ id: "one", output: "hello world", expect: [{ contains: "hello" }, { notContains: "error" }] }] });
  assert.equal(results[0].ok, true);
  assert.match(renderText(results), /1\/1/);
});

test("escapes html report fields and can run an adapter command", () => {
  const html = renderHtml([{ id: "<case>", ok: true, output: "<script>", checks: [] }]);
  assert.match(html, /&lt;case&gt;/);
  assert.doesNotMatch(html, /<script>/);

  const results = runSuiteWithAdapter({
    cases: [{ id: "adapter", prompt: "hello", expect: [{ contains: "hello" }] }]
  }, "cat");
  assert.equal(results[0].ok, true);
});
