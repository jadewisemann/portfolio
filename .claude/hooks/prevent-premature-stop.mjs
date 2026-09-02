import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

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

/*
  요건은 지금 다시 계산한다 (2026-09-01).

  이전에는 `state.nextAction` 문자열을 그대로 출력했다. 그 문자열은 **전이 시점에**
  만들어져 저장되고 이후 갱신되지 않으므로, 요건을 충족한 뒤에도 훅은 계속
  「증거 파일 8개 필요, 현재 0개」라고 말했다. 굳은 스냅샷이 조작자를 오도하는 것은
  `HANDOFF.md` 함정 1번(state.json 의 failedCategories 가 스테일이었다)과 같은 결함이고,
  그때는 사람이 눈치채기를 기대했다. 여기서는 계산한다.
*/
let live = "";
try {
  const graphUrl = pathToFileURL(path.resolve("scripts/graph.mjs")).href;
  const { unmetRequirements } = await import(graphUrl);
  const graph = JSON.parse(fs.readFileSync("docs/portfolio/graph.json", "utf8"));
  const node = graph.nodes[state.currentNode];
  if (node) {
    const unmet = unmetRequirements(node);
    live = unmet.length
      ? `미충족 요건:\n  - ${unmet.join("\n  - ")}\n`
      : "미충족 요건: 없음 (advance 가능)\n";
  }
} catch (error) {
  // 계산에 실패하면 저장된 문자열로 물러난다. 스테일할 수 있음을 밝힌다.
  live = state.nextAction
    ? `다음 행동 (저장된 값이라 스테일할 수 있음): ${state.nextAction}\n`
    : "";
  live += `요건 재계산 실패: ${String(error).split("\n")[0]}\n`;
}

console.error(
  `포트폴리오 워크플로가 ${state.currentNode} 에서 진행 중입니다.\n` +
  live +
  `계속 진행하거나, \`node scripts/graph.mjs advance\` 로 전이하거나, ` +
  `막혔다면 \`node scripts/graph.mjs block "<구체적 이유>"\` 를 실행한 뒤 정지하세요. ` +
  `state.json 을 손으로 편집하지 마세요.`,
);
process.exit(2);
