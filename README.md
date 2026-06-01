# Prompt Regression Tester

Treat prompts like code by testing expected output traits.

## Quick start

```bash
npm install
npm test
node src/index.js examples/suite.json
node src/index.js examples/suite.json --html report.html
```

The MVP uses deterministic fixture outputs, so CI can run without model keys. Replace the adapter later with your model call.
