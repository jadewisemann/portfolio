import fs from "node:fs";
import { spawnSync } from "node:child_process";

const runtimePath = ".claude/runtime.json";
if (!fs.existsSync(runtimePath)) {
  console.error("Missing .claude/runtime.json. Configure project verification before Builder stops.");
  process.exit(2);
}

const runtime = JSON.parse(fs.readFileSync(runtimePath, "utf8"));
const checks = runtime.checks ?? [];
if (!Array.isArray(checks) || checks.length === 0) {
  console.error("No verification commands are configured in .claude/runtime.json.");
  process.exit(2);
}

for (const check of checks) {
  if (typeof check !== "string" || !check.trim()) {
    console.error("Every runtime check must be a non-empty command string.");
    process.exit(2);
  }
  const result = spawnSync(check, { shell: true, stdio: "inherit" });
  if (result.status !== 0) process.exit(2);
}
