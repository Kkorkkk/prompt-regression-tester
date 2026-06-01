#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

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
  const [cmd, ...args] = splitCommand(command);
  if (!cmd) throw new Error("--adapter-command requires a command.");
  const cases = (suite.cases || []).map((item) => ({
    ...item,
    output: runAdapter(cmd, args, item.prompt || "")
  }));
  return runSuite({ ...suite, cases });
}

function splitCommand(command) {
  if (!command || typeof command !== "string") return [];
  const tokens = [];
  let current = "";
  let quote = null;
  for (let index = 0; index < command.length; index++) {
    const char = command[index];
    if (quote) {
      if (char === "\\") current += command[++index] || "";
      else if (char === quote) quote = null;
      else current += char;
    } else if (char === "'" || char === '"') {
      quote = char;
    } else if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }
  if (quote) throw new Error("Unclosed quote in command.");
  if (current) tokens.push(current);
  return tokens;
}

function runAdapter(command, args, input) {
  const result = spawnSync(command, args, {
    input,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"]
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Adapter command failed with exit ${result.status}: ${result.stderr || result.stdout || ""}`.trim());
  return result.stdout.trimEnd();
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

function flagValue(args, flag) {
  const index = args.indexOf(flag);
  if (index === -1) return null;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value.`);
  return value;
}

export function parseCliArgs(args) {
  let file = null;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === "--adapter-command" || args[index] === "--html") {
      index++;
    } else if (!args[index].startsWith("--")) {
      file = args[index];
      break;
    }
  }
  if (!file) throw new Error("Usage: prompt-regression-tester suite.json [--html report.html] [--adapter-command command]");
  return {
    file,
    adapterCommand: flagValue(args, "--adapter-command"),
    htmlPath: flagValue(args, "--html")
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { file, adapterCommand, htmlPath } = parseCliArgs(process.argv.slice(2));
    const suite = JSON.parse(readFileSync(file, "utf8"));
    const results = adapterCommand ? runSuiteWithAdapter(suite, adapterCommand) : runSuite(suite);
    if (htmlPath) writeFileSync(htmlPath, renderHtml(results));
    console.log(renderText(results));
    process.exit(results.every((result) => result.ok) ? 0 : 2);
  } catch (error) {
    console.error(`prompt-regression-tester: ${error.message}`);
    process.exit(2);
  }
}
