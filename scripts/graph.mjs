#!/usr/bin/env node
/**
 * 포트폴리오 워크플로 그래프 엔진.
 *
 * docs/portfolio/state.json 에 쓰는 **유일한** 주체입니다. 모델(메인 대화·에이전트)은
 * state.json 을 손으로 편집하지 않고 이 CLI 만 호출합니다. 전이 규칙(산출물 검사,
 * 게이트 임계값, 반복 한도)은 전부 docs/portfolio/graph.json 데이터에 있고,
 * 이 파일은 그 데이터를 집행할 뿐입니다.
 *
 * 사용법:
 *   node scripts/graph.mjs status              현재 노드·미충족 요건·가능한 전이
 *   node scripts/graph.mjs start               워크플로 활성화
 *   node scripts/graph.mjs advance [outcome]   요건 검사 후 다음 노드로 전이
 *   node scripts/graph.mjs block "<이유>"      구체적 블로커 기록 (정지 허용됨)
 *   node scripts/graph.mjs unblock             블로커 해제
 *   node scripts/graph.mjs scene set|lock <이름>
 *   node scripts/graph.mjs verify <tier>       .claude/runtime.json 의 검증 티어 실행
 *   node scripts/graph.mjs doctor              그래프·하네스 무결성 점검
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PATHS = {
  graph: "docs/portfolio/graph.json",
  state: "docs/portfolio/state.json",
  journal: "docs/portfolio/journal.ndjson",
  runtime: ".claude/runtime.json",
  settings: ".claude/settings.json",
};

/* ---------------------------------------------------------------- 순수 함수 */

/** 그래프 구조 검증. 문제 문자열 배열을 반환한다(비면 정상). */
export function validateGraph(graph) {
  const problems = [];
  const nodes = graph?.nodes ?? {};
  if (!graph?.start || !nodes[graph.start]) problems.push(`start 노드가 없습니다: ${graph?.start}`);
  if (!graph?.terminal || !nodes[graph.terminal]) problems.push(`terminal 노드가 없습니다: ${graph?.terminal}`);

  for (const [name, node] of Object.entries(nodes)) {
    if (node.terminal) {
      if (node.edges) problems.push(`${name}: terminal 노드에 edges 가 있습니다`);
      continue;
    }
    const edges = Object.entries(node.edges ?? {});
    if (edges.length === 0) problems.push(`${name}: 비종단 노드에 edges 가 없습니다`);
    for (const [outcome, target] of edges) {
      if (!nodes[target]) problems.push(`${name} --${outcome}--> ${target}: 대상 노드가 없습니다`);
    }
    if (node.gate) {
      if (!node.edges?.pass || !node.edges?.fail) problems.push(`${name}: gate 노드는 pass/fail 엣지가 모두 필요합니다`);
      for (const [k, v] of Object.entries(node.gate.thresholds ?? {})) {
        if (typeof v !== "number") problems.push(`${name}: 임계값 ${k} 가 숫자가 아닙니다`);
      }
      if (!node.gate.scorecard) problems.push(`${name}: gate 에 scorecard 경로가 없습니다`);
    }
    if (node.maxIterations != null && !node.edges?.exhausted) {
      problems.push(`${name}: maxIterations 노드는 exhausted 엣지가 필요합니다`);
    }
  }

  // start 로부터의 도달성 + terminal 도달 가능성
  if (graph?.start && nodes[graph.start]) {
    const seen = new Set();
    const queue = [graph.start];
    while (queue.length) {
      const cur = queue.shift();
      if (seen.has(cur)) continue;
      seen.add(cur);
      for (const target of Object.values(nodes[cur]?.edges ?? {})) {
        if (nodes[target]) queue.push(target);
      }
    }
    for (const name of Object.keys(nodes)) {
      if (!seen.has(name)) problems.push(`${name}: start 에서 도달할 수 없습니다`);
    }
    if (graph.terminal && nodes[graph.terminal] && !seen.has(graph.terminal)) {
      problems.push(`terminal(${graph.terminal})에 도달할 수 없습니다`);
    }
  }
  return problems;
}

/** 산출물 규칙 하나를 파일 내용에 대해 검사. 위반 설명 또는 null. */
export function checkDocRule(content, rule) {
  if (content == null) return `${rule.path}: 파일이 없습니다`;
  if (rule.mustMatch && !new RegExp(rule.mustMatch, "m").test(content)) {
    return `${rule.path}: /${rule.mustMatch}/ 패턴이 없습니다`;
  }
  if (rule.mustNotMatch && new RegExp(rule.mustNotMatch, "m").test(content)) {
    return `${rule.path}: 아직 플레이스홀더입니다 (/${rule.mustNotMatch}/ 발견)`;
  }
  return null;
}

/** 스코어카드를 임계값과 비교. { pass, failed:[], missing:[] } */
/**
 * `state.failedCategories` 가 지금의 스코어카드 x 임계값과 일치하는지 본다.
 * 어긋나면 사람이 읽을 수 있는 문제 문자열, 일치하면 null.
 *
 * 어떤 게이트 노드를 기준으로 볼지는 상태가 정하지 않으므로, 실패 스냅샷을 남긴
 * 게이트 노드(= `fail` 엣지를 가진 노드) 중 스코어카드가 읽히는 것을 쓴다.
 */
export function checkFailedCategoriesSnapshot(graph, state) {
  const snapshot = state?.failedCategories;
  if (!snapshot || Object.keys(snapshot).length === 0) return null;

  const gateNode = Object.values(graph.nodes).find((n) => n.gate?.thresholds);
  if (!gateNode) return null;

  let scorecard;
  try {
    scorecard = readJson(gateNode.gate.scorecard);
  } catch {
    return null; // 스코어카드 부재는 위에서 따로 보고된다.
  }

  const live = evaluateGate(gateNode.gate, scorecard);
  const liveFailed = new Map(live.failed.map((f) => [f.category, f]));
  const differences = [];

  for (const [category, snap] of Object.entries(snapshot)) {
    const now = liveFailed.get(category);
    if (!now) {
      differences.push(`${category} 는 지금 실패가 아니다 (스냅샷: ${snap.value}/${snap.threshold})`);
    } else if (now.value !== snap.value || now.threshold !== snap.threshold) {
      differences.push(
        `${category} 스냅샷 ${snap.value}/${snap.threshold} 대 실측 ${now.value}/${now.threshold}`,
      );
    }
  }
  for (const [category, now] of liveFailed) {
    if (!(category in snapshot)) {
      differences.push(`${category} ${now.value}/${now.threshold} 가 스냅샷에 없다`);
    }
  }

  if (differences.length === 0) return null;
  return (
    `state.json 의 failedCategories 가 스코어카드와 어긋납니다 (${differences.length}건). ` +
    `작업 목록으로 쓰지 마세요 — 스코어카드 실측값 x graph.json 현재 임계값으로 다시 계산하세요:\n` +
    differences.map((d) => `      · ${d}`).join("\n")
  );
}

export function evaluateGate(gate, scorecard) {
  const failed = [];
  const missing = [];
  for (const [category, threshold] of Object.entries(gate.thresholds ?? {})) {
    const value = scorecard?.scores?.[category]?.value;
    if (typeof value !== "number") missing.push(category);
    else if (value < threshold) failed.push({ category, value, threshold });
  }
  return { pass: failed.length === 0 && missing.length === 0, failed, missing };
}

/**
 * 전이 outcome 결정.
 *  - gate 노드: 스코어카드가 결정한다. 명시 요청이 결과와 다르면 오류.
 *  - maxIterations 노드: 반복 소진 시 exhausted 강제. 조기 exhausted 는 명시 요청으로 허용
 *    (크리틱이 구조 분기를 요구한 경우 — journal 에 기록됨).
 *  - 그 외: 요청값 또는 "pass".
 */
export function pickOutcome(node, state, requested, gateResult) {
  if (node.gate) {
    const outcome = gateResult.pass ? "pass" : "fail";
    if (requested && requested !== outcome) {
      return { error: `gate 노드의 전이는 스코어카드가 결정합니다 (판정: ${outcome})` };
    }
    return { outcome };
  }
  if (node.maxIterations != null && (state.iteration ?? 0) >= node.maxIterations) {
    return { outcome: "exhausted", forced: true };
  }
  const outcome = requested ?? "pass";
  if (!node.edges?.[outcome]) {
    return { error: `알 수 없는 outcome "${outcome}" (가능: ${Object.keys(node.edges ?? {}).join(", ")})` };
  }
  return { outcome };
}

/** 검사를 통과한 전이를 상태에 적용해 새 상태를 반환. */
export function applyAdvance(graph, state, outcome, gateResult) {
  const node = graph.nodes[state.currentNode];
  const targetName = node.edges[outcome];
  const target = graph.nodes[targetName];
  const next = { ...state, currentNode: targetName };

  if (node.gate) {
    if (gateResult.pass) {
      next.iteration = 0;
      next.failedCategories = {};
    } else {
      next.iteration = (state.iteration ?? 0) + 1;
      next.failedCategories = Object.fromEntries(
        gateResult.failed.map((f) => [f.category, { value: f.value, threshold: f.threshold }]),
      );
    }
  }
  if (target.resetIteration) {
    next.iteration = 0;
    next.failedCategories = {};
  }
  if (target.terminal) {
    next.active = false;
    next.status = "COMPLETE";
  }
  return next;
}

/* ------------------------------------------------------------ 파일시스템 계층 */

function abs(rel) {
  return path.join(ROOT, rel);
}
function readJson(rel) {
  return JSON.parse(fs.readFileSync(abs(rel), "utf8"));
}
function readDocOrNull(rel) {
  return fs.existsSync(abs(rel)) ? fs.readFileSync(abs(rel), "utf8") : null;
}
function writeStateAtomic(state) {
  const target = abs(PATHS.state);
  const tmp = `${target}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(state, null, 2)}\n`);
  fs.renameSync(tmp, target);
}
function journal(entry) {
  fs.appendFileSync(abs(PATHS.journal), `${JSON.stringify({ ts: new Date().toISOString(), ...entry })}\n`);
}

/** 노드의 미충족 요건 목록(파일시스템 실측). */
export function unmetRequirements(node) {
  const unmet = [];
  for (const rule of node.produces ?? []) {
    const problem = checkDocRule(readDocOrNull(rule.path), rule);
    if (problem) unmet.push(problem);
  }
  // `evidence` 는 하나의 규칙이거나 규칙 배열이다. 배열을 받는 이유: 방향을 확정하는
  // 노드는 산문 스펙과 **렌더된 픽셀**을 동시에 요구해야 한다. 규칙이 하나뿐이면
  // 마크다운만으로 게이트가 열리고, 그러면 종이에서만 성립하는 방향이 통과한다.
  for (const rule of [node.evidence ?? []].flat()) {
    const { dir, minFiles, pattern, why, fresherThan } = rule;
    const re = new RegExp(pattern ?? ".");
    const files = fs.existsSync(abs(dir)) ? fs.readdirSync(abs(dir)).filter((f) => re.test(f)) : [];
    if (files.length < minFiles) {
      unmet.push(
        `${dir}: 증거 파일 ${minFiles}개 필요, 현재 ${files.length}개 (/${pattern}/)` +
          (why ? ` — ${why}` : ""),
      );
      continue;
    }
    // `fresherThan` 은 「판정 직전에 재캡처한다」를 기계로 강제한다. 파일 개수만 세면
    // 이전 런의 스크린샷으로 게이트가 열리고, 그러면 소스에 더는 없는 화면을 심사하게
    // 된다 — 2026-08-31 런이 실제로 그 직전까지 갔다.
    if (fresherThan) {
      const source = newestMtime(abs(fresherThan));
      const stale = files.filter((f) => fs.statSync(path.join(abs(dir), f)).mtimeMs < source);
      if (stale.length) {
        unmet.push(
          `${dir}: ${fresherThan}/ 보다 오래된 증거 ${stale.length}개 ` +
            `(예: ${stale.slice(0, 3).join(", ")}) — 판정 직전에 재캡처하세요`,
        );
      }
    }
  }
  return unmet;
}

/** 디렉터리 안에서 가장 최근 수정 시각(ms). 없으면 0. */
function newestMtime(dir) {
  if (!fs.existsSync(dir)) return 0;
  let newest = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) newest = Math.max(newest, newestMtime(full));
    else newest = Math.max(newest, fs.statSync(full).mtimeMs);
  }
  return newest;
}

/** runtime.json 의 검증 티어를 실행. 성공 시 true. */
function runVerifyTier(tier) {
  const runtime = readJson(PATHS.runtime);
  const checks = runtime[tier];
  if (!Array.isArray(checks) || checks.length === 0) {
    console.error(`.claude/runtime.json 에 "${tier}" 티어가 없거나 비어 있습니다.`);
    return false;
  }
  for (const check of checks) {
    console.log(`\n$ ${check}`);
    const result = spawnSync(check, { shell: true, stdio: "inherit", cwd: ROOT });
    if (result.status !== 0) {
      console.error(`검증 실패: ${check}`);
      return false;
    }
  }
  return true;
}

/** 다음 행동 힌트 문자열 계산(상태 저장 시 nextAction 으로 기록). */
function describeNextAction(graph, nodeName) {
  const node = graph.nodes[nodeName];
  if (!node) return null;
  const parts = [`[${nodeName}] ${node.title}`];
  if (node.agents?.length) parts.push(`위임: ${node.agents.join(", ")}${node.parallel ? " (병렬)" : ""}`);
  if (node.skill) parts.push(`스킬: ${node.skill}`);
  const unmet = unmetRequirements(node);
  if (unmet.length) parts.push(`필요: ${unmet.join(" | ")}`);
  if (node.gate) parts.push(`게이트: ${node.gate.scorecard} 점수 기록 후 advance`);
  if (node.verify) parts.push(`검증: ${node.verify}`);
  return parts.join(" — ");
}

/* ------------------------------------------------------------------ doctor */

function runDoctor(graph) {
  const problems = [...validateGraph(graph)];

  for (const [name, node] of Object.entries(graph.nodes)) {
    for (const agent of node.agents ?? []) {
      if (!fs.existsSync(abs(`.claude/agents/${agent}.md`))) {
        problems.push(`${name}: 에이전트 정의가 없습니다 (.claude/agents/${agent}.md)`);
      }
    }
    if (node.skill && !fs.existsSync(abs(`.claude/skills/${node.skill}/SKILL.md`))) {
      problems.push(`${name}: 스킬이 없습니다 (.claude/skills/${node.skill}/SKILL.md)`);
    }
    if (node.verify && node.verify !== "doctor") {
      const runtime = fs.existsSync(abs(PATHS.runtime)) ? readJson(PATHS.runtime) : {};
      if (!Array.isArray(runtime[node.verify])) {
        problems.push(`${name}: runtime.json 에 "${node.verify}" 검증 티어가 없습니다`);
      }
    }
    if (node.gate?.scorecard) {
      const raw = readDocOrNull(node.gate.scorecard);
      if (raw == null) problems.push(`${name}: 스코어카드 파일이 없습니다 (${node.gate.scorecard})`);
      else {
        try {
          JSON.parse(raw);
        } catch {
          problems.push(`${name}: 스코어카드가 JSON 이 아닙니다 (${node.gate.scorecard})`);
        }
      }
    }
  }

  /*
    스테일 스냅샷 점검.

    `state.json` 의 `failedCategories` 는 advance 시점에 굳는다. 그 뒤에 스코어카드가
    실측값으로 다시 쓰이거나 임계값이 바뀌면 스냅샷은 아무도 모르게 거짓이 된다.
    2026-08-31 런에서 실제로 그렇게 됐다 — 스냅샷은 실패 7개를 말했고 실제로는
    10개였으며, 남아 있던 값은 디렉터가 스스로 관대하다고 판정해 폐기한 자체 추정치였다
    (visualImpact 4.5 대 실측 2.8). 그 목록으로 작업하면 세 항목을 통째로 놓친다.

    `HANDOFF.md` §3 은 이것을 「미해결 하네스 결함」으로 적어 두고 사람에게 재계산을
    부탁했다. 부탁 대신 검사로 바꾼다.
  */
  const snapshotProblem = checkFailedCategoriesSnapshot(graph, readJson(PATHS.state));
  if (snapshotProblem) problems.push(snapshotProblem);

  // 훅 배선 점검: settings.json 이 참조하는 로컬 훅 스크립트 존재 여부
  const settingsRaw = readDocOrNull(PATHS.settings);
  if (settingsRaw) {
    for (const match of settingsRaw.matchAll(/node (\.claude\/hooks\/[\w-]+\.mjs)/g)) {
      if (!fs.existsSync(abs(match[1]))) problems.push(`settings.json 이 없는 훅을 참조합니다: ${match[1]}`);
    }
  }

  const state = readJson(PATHS.state);
  if (!graph.nodes[state.currentNode]) {
    problems.push(`state.currentNode(${state.currentNode})가 그래프에 없습니다`);
  }
  return problems;
}

/* --------------------------------------------------------------------- CLI */

function printStatus(graph, state) {
  const node = graph.nodes[state.currentNode];
  console.log(`노드     : ${state.currentNode} — ${node?.title ?? "?"}`);
  console.log(`상태     : active=${state.active} status=${state.status} iteration=${state.iteration}`);
  if (state.blocker) console.log(`블로커   : ${state.blocker}`);
  if (Object.keys(state.failedCategories ?? {}).length) {
    console.log(`실패 항목: ${JSON.stringify(state.failedCategories)}`);
  }
  if (node && !node.terminal) {
    const unmet = unmetRequirements(node);
    console.log(unmet.length ? `미충족   :\n  - ${unmet.join("\n  - ")}` : "미충족   : 없음 (advance 가능)");
    console.log(`전이     : ${Object.entries(node.edges).map(([o, t]) => `${o}→${t}`).join(", ")}`);
  }
  if (state.nextAction) console.log(`다음     : ${state.nextAction}`);
}

function cmdAdvance(graph, state, requested) {
  const node = graph.nodes[state.currentNode];
  if (!node) return fail(`현재 노드(${state.currentNode})가 그래프에 없습니다. doctor 를 실행하세요.`);
  if (node.terminal) return fail("이미 종단 노드입니다.");
  if (!state.active) return fail("워크플로가 비활성입니다. 먼저 `start` 를 실행하세요.");
  if (state.blocker) return fail(`블로커가 기록되어 있습니다: "${state.blocker}" — 해결 후 \`unblock\` 하세요.`);

  // 1) 현재 노드의 산출물·증거 요건
  const unmet = unmetRequirements(node);
  if (unmet.length) return fail(`전이 거부 — 미충족 요건:\n  - ${unmet.join("\n  - ")}`);

  // 2) verify (doctor 또는 runtime 티어)
  if (node.verify === "doctor") {
    const problems = runDoctor(graph);
    if (problems.length) return fail(`doctor 실패:\n  - ${problems.join("\n  - ")}`);
    console.log("doctor: 문제 없음");
  } else if (node.verify) {
    if (!runVerifyTier(node.verify)) return fail(`"${node.verify}" 검증 티어 실패`);
  }

  // 3) gate 평가
  let gateResult = null;
  if (node.gate) {
    let scorecard;
    try {
      scorecard = readJson(node.gate.scorecard);
    } catch {
      return fail(`스코어카드를 읽을 수 없습니다: ${node.gate.scorecard}`);
    }
    gateResult = evaluateGate(node.gate, scorecard);
    if (gateResult.missing.length) {
      return fail(`스코어카드 미기록 항목: ${gateResult.missing.join(", ")} — 판정 불가`);
    }
    for (const f of gateResult.failed) console.log(`게이트 실패: ${f.category} ${f.value} < ${f.threshold}`);
    if (gateResult.pass) console.log("게이트: 전 항목 통과");
  }

  // 4) outcome 결정 및 적용
  const picked = pickOutcome(node, state, requested, gateResult);
  if (picked.error) return fail(picked.error);
  if (picked.forced) console.log(`반복 한도(${node.maxIterations}) 소진 — exhausted 전이 강제`);

  const target = node.edges[picked.outcome];
  const targetNode = graph.nodes[target];
  for (const rule of targetNode.requires ?? []) {
    const problem = checkDocRule(readDocOrNull(rule.path), rule);
    if (problem) return fail(`진입 거부 (${target}): ${problem}`);
  }

  const next = applyAdvance(graph, state, picked.outcome, gateResult);
  next.nextAction = targetNode.terminal ? null : describeNextAction(graph, target);
  writeStateAtomic(next);
  journal({
    event: "advance",
    from: state.currentNode,
    to: target,
    outcome: picked.outcome,
    iteration: next.iteration,
    ...(gateResult ? { gate: gateResult } : {}),
  });
  console.log(`\n${state.currentNode} --${picked.outcome}--> ${target}`);
  printStatus(graph, next);
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  const graph = readJson(PATHS.graph);
  const state = readJson(PATHS.state);

  switch (command) {
    case "status":
      printStatus(graph, state);
      break;
    case "start": {
      if (state.active) return console.log("이미 활성 상태입니다.");
      const next = { ...state, active: true, status: "RUNNING", nextAction: describeNextAction(graph, state.currentNode) };
      writeStateAtomic(next);
      journal({ event: "start", node: state.currentNode });
      printStatus(graph, next);
      break;
    }
    case "advance":
      cmdAdvance(graph, state, rest[0]);
      break;
    case "block": {
      const reason = rest.join(" ").trim();
      if (!reason) return fail("블로커 이유가 필요합니다: block \"<이유>\"");
      writeStateAtomic({ ...state, blocker: reason, status: "BLOCKED" });
      journal({ event: "block", node: state.currentNode, reason });
      console.log(`블로커 기록됨: ${reason}`);
      break;
    }
    case "unblock":
      writeStateAtomic({ ...state, blocker: null, status: state.active ? "RUNNING" : "IDLE" });
      journal({ event: "unblock", node: state.currentNode });
      console.log("블로커 해제됨.");
      break;
    case "scene": {
      const [action, name] = rest;
      if (action === "set") writeStateAtomic({ ...state, currentScene: name ?? null });
      else if (action === "lock" && name) {
        writeStateAtomic({ ...state, lockedScenes: [...new Set([...(state.lockedScenes ?? []), name])] });
      } else return fail("사용법: scene set <이름> | scene lock <이름>");
      journal({ event: `scene-${action}`, name });
      console.log(`scene ${action}: ${name}`);
      break;
    }
    case "verify":
      if (!rest[0]) return fail("사용법: verify <tier>");
      if (!runVerifyTier(rest[0])) process.exitCode = 1;
      break;
    case "doctor": {
      const problems = runDoctor(graph);
      if (problems.length) {
        console.error(`문제 ${problems.length}건:\n  - ${problems.join("\n  - ")}`);
        process.exitCode = 1;
      } else console.log("doctor: 그래프·하네스 무결성 문제 없음");
      break;
    }
    default:
      fail("사용법: graph.mjs status|start|advance [outcome]|block <이유>|unblock|scene set|lock <이름>|verify <tier>|doctor");
  }
}

const invokedDirectly =
  process.argv[1] &&
  path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (invokedDirectly) main();
