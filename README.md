# Prompt Regression Tester

[![CI](https://github.com/Kkorkkk/prompt-regression-tester/actions/workflows/ci.yml/badge.svg)](https://github.com/Kkorkkk/prompt-regression-tester/actions/workflows/ci.yml)

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
