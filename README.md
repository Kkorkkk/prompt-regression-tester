# Prompt Regression Tester

Treat prompts like code by testing expected output traits.

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

The adapter command is intentionally user supplied and runs in your shell. Only point it at commands you trust.
