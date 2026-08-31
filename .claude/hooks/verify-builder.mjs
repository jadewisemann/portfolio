import fs from "node:fs";
import { spawnSync } from "node:child_process";

const input = JSON.parse(await new Promise((resolve) => {
  let data = "";
  process.stdin.on("data", (chunk) => { data += chunk; });
  process.stdin.on("end", () => resolve(data));
}));
if (input.stop_hook_active) process.exit(0);

const runtimePath = ".claude/runtime.json";
if (!fs.existsSync(runtimePath)) {
  console.error("Missing .claude/runtime.json. Configure project verification before Builder stops.");
  process.exit(2);
}

const runtime = JSON.parse(fs.readFileSync(runtimePath, "utf8"));
// 빌더 정지 시에는 빠른 티어만 돈다. 전체 게이트(e2e 포함)는 REGRESSION 노드에서
// graph.mjs 가 실행한다 — 이중 빌드를 피하기 위한 분리다.
const checks = runtime.builder ?? runtime.checks ?? [];
if (!Array.isArray(checks) || checks.length === 0) {
  console.error("No builder verification commands are configured in .claude/runtime.json.");
  process.exit(2);
}

for (const check of checks) {
  if (typeof check !== "string" || !check.trim()) {
    console.error("Every runtime check must be a non-empty command string.");
    process.exit(2);
  }
  const result = spawnSync(check, { shell: true, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`Builder verification failed: ${check}`);
    process.exit(2);
  }
}
