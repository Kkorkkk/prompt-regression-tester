# Prompt Regression Tester

[![CI](https://github.com/Kkorkkk/prompt-regression-tester/actions/workflows/ci.yml/badge.svg)](https://github.com/Kkorkkk/prompt-regression-tester/actions/workflows/ci.yml)

## Overview / 项目说明

English: Prompt Regression Tester helps treat prompts like testable project assets. It runs deterministic fixture checks by default, can call a trusted local adapter command, and reports whether each prompt output still matches the expectations you care about.

中文：Prompt Regression Tester 用来把提示词当作可以测试的项目资产管理。默认模式使用确定性的 fixture 检查，也可以调用你信任的本地适配器命令，并报告每个提示词输出是否仍符合关键预期。

Treat prompts like code by testing expected output traits.

## Install

```bash
npx prompt-regression-tester examples/suite.json
npm install -g prompt-regression-tester
prompt-regression-tester examples/suite.json
```

## Quick start

```bash
npm install
npm test
node src/index.js examples/suite.json
node src/index.js examples/suite.json --html report.html
node src/index.js examples/suite.json --adapter-command "cat"
```

The default mode uses deterministic fixture outputs, so CI can run without model keys. Use `--adapter-command` to pipe each prompt to your own model wrapper, local script, or mock adapter.

## Limits

The adapter command is intentionally user supplied and now runs without a shell. Only point it at commands you trust, and pass the command plus arguments as one quoted value.

Adapter commands have a 30 second timeout and a bounded output buffer so CI jobs do not hang forever on a broken model wrapper.

Example output:

```txt
Prompt regression: 2/2 passing
PASS greeting: ok contains hello
```

## Status

Experimental 0.1 CLI. The tool is small on purpose, with no runtime dependencies. Review generated commands, code, and reports before using them in production workflows.
