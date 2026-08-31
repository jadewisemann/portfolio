import fs from "node:fs";

const input = JSON.parse(await new Promise((resolve) => {
  let data = "";
  process.stdin.on("data", (chunk) => { data += chunk; });
  process.stdin.on("end", () => resolve(data));
}));

const statePath = "docs/portfolio/state.json";
if (!fs.existsSync(statePath) || input.stop_hook_active) process.exit(0);

const state = JSON.parse(fs.readFileSync(statePath, "utf8"));

// 비활성이거나 완료면 자유롭게 정지.
if (!state.active || state.status === "COMPLETE") process.exit(0);

// 구체적 블로커가 CLI 로 기록돼 있으면 정지는 정당하다.
if (state.blocker) process.exit(0);

console.error(
  `포트폴리오 워크플로가 ${state.currentNode} 에서 진행 중입니다.\n` +
  (state.nextAction ? `다음 행동: ${state.nextAction}\n` : "") +
  `계속 진행하거나, \`node scripts/graph.mjs advance\` 로 전이하거나, ` +
  `막혔다면 \`node scripts/graph.mjs block "<구체적 이유>"\` 를 실행한 뒤 정지하세요. ` +
  `state.json 을 손으로 편집하지 마세요.`,
);
process.exit(2);
