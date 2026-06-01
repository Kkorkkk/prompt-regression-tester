#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

export function runSuite(suite) {
  return (suite.cases || []).map((item) => {
    const output = item.output ?? suite.fixtures?.[item.id] ?? "";
    const checks = (item.expect || []).map((expectation) => {
      if (expectation.contains) return { ok: output.includes(expectation.contains), label: `contains ${expectation.contains}` };
      if (expectation.regex) return { ok: new RegExp(expectation.regex).test(output), label: `matches /${expectation.regex}/` };
      if (expectation.notContains) return { ok: !output.includes(expectation.notContains), label: `omits ${expectation.notContains}` };
      return { ok: false, label: "unknown expectation" };
    });
    return { id: item.id, prompt: item.prompt, output, checks, ok: checks.every((check) => check.ok) };
  });
}

export function runSuiteWithAdapter(suite, command) {
  const cases = (suite.cases || []).map((item) => ({
    ...item,
    output: execSync(command, {
      input: item.prompt || "",
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      shell: true
    }).trimEnd()
  }));
  return runSuite({ ...suite, cases });
}

export function renderText(results) {
  const passed = results.filter((result) => result.ok).length;
  return [
    `Prompt regression: ${passed}/${results.length} passing`,
    ...results.map((result) => `${result.ok ? "PASS" : "FAIL"} ${result.id}: ${result.checks.map((check) => `${check.ok ? "ok" : "bad"} ${check.label}`).join(", ")}`)
  ].join("\n") + "\n";
}

export function renderHtml(results) {
  const rows = results.map((result) => `<tr><td>${result.ok ? "PASS" : "FAIL"}</td><td>${escapeHtml(result.id)}</td><td><pre>${escapeHtml(result.output)}</pre></td></tr>`).join("");
  return `<!doctype html><meta charset="utf-8"><title>Prompt report</title><style>body{font-family:system-ui;margin:32px}td{border-top:1px solid #ddd;padding:8px}pre{white-space:pre-wrap}</style><h1>Prompt Regression Report</h1><table>${rows}</table>`;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: prompt-regression-tester suite.json [--html report.html]");
    process.exit(1);
  }
  try {
    const suite = JSON.parse(readFileSync(file, "utf8"));
    const adapterIndex = process.argv.indexOf("--adapter-command");
    const results = adapterIndex > -1 ? runSuiteWithAdapter(suite, process.argv[adapterIndex + 1]) : runSuite(suite);
    const htmlIndex = process.argv.indexOf("--html");
    if (htmlIndex > -1) writeFileSync(process.argv[htmlIndex + 1] || "prompt-report.html", renderHtml(results));
    console.log(renderText(results));
    process.exit(results.every((result) => result.ok) ? 0 : 2);
  } catch (error) {
    console.error(`prompt-regression-tester: ${error.message}`);
    process.exit(2);
  }
}
