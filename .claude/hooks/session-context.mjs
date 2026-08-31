import fs from "node:fs";

const statePath = "docs/portfolio/state.json";

if (!fs.existsSync(statePath)) {
  process.exit(0);
}

const state = fs.readFileSync(statePath, "utf8");

console.log(`PORTFOLIO WORKFLOW STATE:

${state}

Read docs/portfolio/DECISIONS.md before resuming substantial portfolio work.
`);