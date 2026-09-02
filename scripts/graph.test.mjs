import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  applyAdvance,
  checkDocRule,
  checkFailedCategoriesSnapshot,
  evaluateGate,
  pickOutcome,
  unmetRequirements,
  validateGraph,
} from "./graph.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const realGraph = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/portfolio/graph.json"), "utf8"));

describe("validateGraph", () => {
  it("실제 graph.json 은 구조 문제가 없다", () => {
    expect(validateGraph(realGraph)).toEqual([]);
  });

  it("끊어진 엣지를 잡아낸다", () => {
    const graph = {
      start: "A",
      terminal: "Z",
      nodes: { A: { edges: { pass: "MISSING" } }, Z: { terminal: true } },
    };
    const problems = validateGraph(graph);
    expect(problems.some((p) => p.includes("MISSING"))).toBe(true);
  });

  it("start 에서 도달 불가능한 노드를 잡아낸다", () => {
    const graph = {
      start: "A",
      terminal: "Z",
      nodes: {
        A: { edges: { pass: "Z" } },
        ORPHAN: { edges: { pass: "Z" } },
        Z: { terminal: true },
      },
    };
    expect(validateGraph(graph).some((p) => p.startsWith("ORPHAN"))).toBe(true);
  });

  it("gate 노드에 fail 엣지가 없으면 잡아낸다", () => {
    const graph = {
      start: "A",
      terminal: "Z",
      nodes: {
        A: { gate: { scorecard: "s.json", thresholds: { x: 9 } }, edges: { pass: "Z" } },
        Z: { terminal: true },
      },
    };
    expect(validateGraph(graph).some((p) => p.includes("pass/fail"))).toBe(true);
  });
});

describe("checkDocRule", () => {
  it("플레이스홀더를 미충족으로 판정한다", () => {
    const rule = { path: "BRIEF.md", mustNotMatch: "Status: not supplied" };
    expect(checkDocRule("# Brief\n\nStatus: not supplied.", rule)).toContain("플레이스홀더");
    expect(checkDocRule("# Brief\n\n실제 내용", rule)).toBeNull();
  });

  it("필수 패턴 부재와 파일 부재를 구분해 보고한다", () => {
    const rule = { path: "X.md", mustMatch: "https?://" };
    expect(checkDocRule("링크 없음", rule)).toContain("패턴이 없습니다");
    expect(checkDocRule(null, rule)).toContain("파일이 없습니다");
    expect(checkDocRule("https://example.com", rule)).toBeNull();
  });
});

describe("evaluateGate", () => {
  const gate = { thresholds: { visualImpact: 9, typography: 8.5 } };

  it("전 항목 임계값 이상이면 통과한다", () => {
    const scorecard = { scores: { visualImpact: { value: 9 }, typography: { value: 8.5 } } };
    expect(evaluateGate(gate, scorecard)).toEqual({ pass: true, failed: [], missing: [] });
  });

  it("임계값 미달 항목을 실패로 나열한다", () => {
    const scorecard = { scores: { visualImpact: { value: 8.9 }, typography: { value: 9 } } };
    const result = evaluateGate(gate, scorecard);
    expect(result.pass).toBe(false);
    expect(result.failed).toEqual([{ category: "visualImpact", value: 8.9, threshold: 9 }]);
  });

  it("미기록(null) 점수는 missing 으로 분리하고 통과시키지 않는다", () => {
    const scorecard = { scores: { visualImpact: { value: null }, typography: { value: 10 } } };
    const result = evaluateGate(gate, scorecard);
    expect(result.pass).toBe(false);
    expect(result.missing).toEqual(["visualImpact"]);
  });
});

describe("pickOutcome", () => {
  const gateNode = realGraph.nodes.GOLDEN_REVIEW;
  const fixNode = realGraph.nodes.GOLDEN_FIX;

  it("gate 노드는 스코어카드 판정이 엣지를 결정한다", () => {
    expect(pickOutcome(gateNode, { iteration: 0 }, undefined, { pass: false, failed: [], missing: [] })).toEqual({ outcome: "fail" });
    expect(pickOutcome(gateNode, { iteration: 0 }, "pass", { pass: false, failed: [], missing: [] }).error).toBeTruthy();
  });

  it("GOLDEN_FIX 는 반복 소진 시 exhausted 를 강제한다", () => {
    expect(pickOutcome(fixNode, { iteration: 3 }, "pass", null)).toEqual({ outcome: "exhausted", forced: true });
    expect(pickOutcome(fixNode, { iteration: 2 }, undefined, null)).toEqual({ outcome: "pass" });
  });

  it("조기 구조 분기는 명시 요청으로 허용된다", () => {
    expect(pickOutcome(fixNode, { iteration: 1 }, "exhausted", null)).toEqual({ outcome: "exhausted" });
  });

  it("정의되지 않은 outcome 은 거부한다", () => {
    expect(pickOutcome(fixNode, { iteration: 0 }, "nonsense", null).error).toBeTruthy();
  });
});

describe("applyAdvance", () => {
  const base = { active: true, status: "RUNNING", currentNode: "GOLDEN_REVIEW", iteration: 0, failedCategories: {} };

  it("게이트 실패 시 iteration 을 올리고 실패 항목을 기록한다", () => {
    const gateResult = { pass: false, failed: [{ category: "typography", value: 8, threshold: 8.5 }], missing: [] };
    const next = applyAdvance(realGraph, base, "fail", gateResult);
    expect(next.currentNode).toBe("GOLDEN_FIX");
    expect(next.iteration).toBe(1);
    expect(next.failedCategories).toEqual({ typography: { value: 8, threshold: 8.5 } });
  });

  it("게이트 통과 시 iteration 과 실패 항목을 초기화한다", () => {
    const dirty = { ...base, iteration: 2, failedCategories: { typography: { value: 8, threshold: 8.5 } } };
    const next = applyAdvance(realGraph, dirty, "pass", { pass: true, failed: [], missing: [] });
    expect(next.currentNode).toBe("EXPAND_SCENES");
    expect(next.iteration).toBe(0);
    expect(next.failedCategories).toEqual({});
  });

  it("STRUCTURAL_BRANCH 진입은 iteration 을 초기화한다", () => {
    const state = { ...base, currentNode: "GOLDEN_FIX", iteration: 3 };
    const next = applyAdvance(realGraph, state, "exhausted", null);
    expect(next.currentNode).toBe("STRUCTURAL_BRANCH");
    expect(next.iteration).toBe(0);
  });

  it("종단 노드 진입은 워크플로를 종료한다", () => {
    const state = { ...base, currentNode: "REGRESSION" };
    const next = applyAdvance(realGraph, state, "pass", null);
    expect(next.currentNode).toBe("COMPLETE");
    expect(next.active).toBe(false);
    expect(next.status).toBe("COMPLETE");
  });
});

/**
 * 2026-08-31 런의 근본 결함에 대한 회귀 가드.
 *
 * 그 런은 아트 디렉션을 마크다운 3장만 보고 확정했다. 게이트가 `.md` 파일 개수만
 * 셌기 때문이다. 그래서 종이에서만 성립하는 방향이 통과했고, 골든 슬라이스는
 * 시각 충격 2.8 / 9.0 을 받았다 — 비평가 표현으로 "리더 모드의 한국어 기술
 * 블로그와 구별되지 않는" 문서였다.
 *
 * 이 테스트는 그 구멍이 다시 열리는 것을 막는다. 게이트를 산문만으로 되돌리면
 * 여기서 깨진다.
 */
describe("방향 확정은 픽셀을 요구한다", () => {
  const rules = (name) => [realGraph.nodes[name]?.evidence ?? []].flat();

  it("DIRECTION_JUDGE 가 렌더된 PNG 를 요구한다", () => {
    const png = rules("DIRECTION_JUDGE").filter((r) => /png/.test(r.pattern ?? ""));
    // 없으면 스펙만 읽고 방향을 고를 수 있게 된다.
    expect(png.length).toBeGreaterThan(0);
    // 방향 3개 x 뷰포트 3개 = 최소 9장.
    expect(png.some((r) => r.minFiles >= 9)).toBe(true);
  });

  it("모바일 렌더가 강제된다", () => {
    // 데스크톱만 렌더하면 3안의 모바일이 바이트 동일해진다 (그 런의 실제 결함).
    const mobile = rules("DIRECTION_RENDER").filter((r) => /320/.test(r.pattern ?? ""));
    expect(mobile.length).toBeGreaterThan(0);
  });

  it("ART_DIRECTION_BRANCH 가 판정 노드로 직결되지 않는다", () => {
    // 브랜치에서 판정으로 바로 가면 렌더 단계를 건너뛴다.
    expect(realGraph.nodes.ART_DIRECTION_BRANCH.edges.pass).toBe("DIRECTION_RENDER");
  });

  it("확정 근거로 스크린샷 경로를 DECISIONS.md 에 남기게 한다", () => {
    const produces = realGraph.nodes.DIRECTION_JUDGE.produces ?? [];
    expect(
      produces.some(
        (p) => p.path.endsWith("DECISIONS.md") && /review\/directions/.test(p.mustMatch ?? ""),
      ),
    ).toBe(true);
  });

  it("evidence 규칙 배열이 엔진에서 실제로 집행된다", () => {
    // 엔진이 배열을 못 읽으면 두 번째 규칙(모바일 강제)이 조용히 무시된다.
    // 규칙 두 개를 주고 둘 다 미충족으로 보고되는지 확인한다.
    const unmet = unmetRequirements({
      evidence: [
        { dir: "does/not/exist", minFiles: 9, pattern: "\\.png$" },
        { dir: "does/not/exist", minFiles: 3, pattern: "320.*\\.png$", why: "모바일 강제" },
      ],
    });
    expect(unmet).toHaveLength(2);
    expect(unmet[1]).toContain("모바일 강제");
  });

  it("실제 DIRECTION_JUDGE 노드가 지금 미충족이다", () => {
    // review/directions/ 가 아직 없으므로 이 게이트는 실제로 닫혀 있어야 한다.
    // 열려 있다면 규칙이 집행되지 않는다는 뜻이다.
    const unmet = unmetRequirements({ evidence: realGraph.nodes.DIRECTION_JUDGE.evidence });
    expect(unmet.length).toBeGreaterThan(0);
  });
});

/**
 * 구조 재설계도 픽셀을 요구한다.
 *
 * `ART_DIRECTION_BRANCH` 는 `.md` 3장으로 통과했고, 그렇게 고른 방향이 시각 충격
 * 2.8 / 9.0 을 받았다. 그 구멍은 `DIRECTION_RENDER` 를 끼워 막았다.
 *
 * `STRUCTURAL_BRANCH` 는 같은 구멍을 그대로 가지고 있었다 — 요건이 `DECISIONS.md` 에
 * 「## Structural branch」라는 문자열 하나뿐이어서, 렌더된 화면 없이 산문만으로 개념을
 * 확정할 수 있었다. 개념이 틀려서 오는 노드인데 개념을 다시 종이에서 고르게 되어 있었다.
 *
 * 게이트를 산문으로 되돌리면 여기서 깨진다.
 */
describe("구조 재설계도 픽셀을 요구한다", () => {
  const node = () => realGraph.nodes.STRUCTURAL_BRANCH;

  it("STRUCTURAL_BRANCH 가 렌더된 PNG 를 요구한다", () => {
    const png = [node().evidence ?? []].flat().filter((r) => /png/.test(r.pattern ?? ""));
    expect(png.length).toBeGreaterThan(0);
    // 후보 3개 x 뷰포트 3개 = 최소 9장.
    expect(png.some((r) => r.minFiles >= 9)).toBe(true);
  });

  it("구조 후보의 모바일 렌더가 강제된다", () => {
    const mobile = [node().evidence ?? []].flat().filter((r) => /320/.test(r.pattern ?? ""));
    expect(mobile.length).toBeGreaterThan(0);
  });

  it("확정 근거로 스크린샷 경로를 DECISIONS.md 에 남기게 한다", () => {
    const produces = node().produces ?? [];
    expect(
      produces.some(
        (p) => p.path.endsWith("DECISIONS.md") && /review\/structural/.test(p.mustMatch ?? ""),
      ),
    ).toBe(true);
  });
});

/**
 * 증거의 신선도.
 *
 * `HANDOFF.md` §3 의 함정 셋 중 하나가 「스테일 스크린샷으로 판정하지 마라」인데,
 * 그건 사람에게 거는 부탁이었고 게이트는 파일 **개수**만 셌다. 이전 런의 캡처가
 * 디렉터리에 남아 있으면 소스가 완전히 바뀐 뒤에도 게이트가 그대로 열린다.
 * 2026-08-31 런은 실제로 존재하지 않는 페이지를 심사하기 직전까지 갔다.
 *
 * `fresherThan` 은 그 부탁을 검사로 바꾼다.
 */
describe("증거는 소스보다 새것이어야 한다", () => {
  const tmp = path.join(os.tmpdir(), `graph-fresh-${process.pid}`);
  const evidence = path.join(tmp, "review");
  const source = path.join(tmp, "src");

  beforeEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.mkdirSync(evidence, { recursive: true });
    fs.mkdirSync(source, { recursive: true });
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  const rule = (extra = {}) => ({
    evidence: [
      { dir: path.relative(ROOT, evidence), minFiles: 1, pattern: "\\.png$", ...extra },
    ],
  });

  it("소스보다 오래된 캡처를 미충족으로 잡는다", () => {
    fs.writeFileSync(path.join(evidence, "shot.png"), "x");
    const past = Date.now() - 60_000;
    fs.utimesSync(path.join(evidence, "shot.png"), past / 1000, past / 1000);
    fs.writeFileSync(path.join(source, "page.tsx"), "x");

    const unmet = unmetRequirements(rule({ fresherThan: path.relative(ROOT, source) }));
    expect(unmet).toHaveLength(1);
    expect(unmet[0]).toContain("재캡처");
  });

  it("소스보다 새 캡처는 통과한다", () => {
    fs.writeFileSync(path.join(source, "page.tsx"), "x");
    const past = Date.now() - 60_000;
    fs.utimesSync(path.join(source, "page.tsx"), past / 1000, past / 1000);
    fs.writeFileSync(path.join(evidence, "shot.png"), "x");

    expect(unmetRequirements(rule({ fresherThan: path.relative(ROOT, source) }))).toEqual([]);
  });

  it("fresherThan 이 없으면 신선도를 보지 않는다", () => {
    fs.writeFileSync(path.join(evidence, "shot.png"), "x");
    const past = Date.now() - 60_000;
    fs.utimesSync(path.join(evidence, "shot.png"), past / 1000, past / 1000);
    fs.writeFileSync(path.join(source, "page.tsx"), "x");

    expect(unmetRequirements(rule())).toEqual([]);
  });

  it("개수가 모자라면 신선도 대신 개수를 보고한다", () => {
    // 두 메시지가 겹쳐 나오면 원인이 흐려진다.
    const unmet = unmetRequirements({
      evidence: [
        {
          dir: path.relative(ROOT, evidence),
          minFiles: 3,
          pattern: "\\.png$",
          fresherThan: path.relative(ROOT, source),
        },
      ],
    });
    expect(unmet).toHaveLength(1);
    expect(unmet[0]).toContain("증거 파일 3개 필요");
  });
});

describe("픽셀 게이트는 재캡처를 요구한다", () => {
  it.each(["STRUCTURAL_BRANCH", "DIRECTION_RENDER", "DIRECTION_JUDGE"])(
    "%s 의 모든 증거 규칙에 fresherThan 이 걸려 있다",
    (name) => {
      const rules = [realGraph.nodes[name].evidence ?? []].flat();
      expect(rules.length).toBeGreaterThan(0);
      // 하나라도 빠지면 그 규칙만으로 스테일 증거가 게이트를 연다.
      expect(rules.every((r) => r.fresherThan === "src")).toBe(true);
    },
  );
});

/**
 * 스테일 스냅샷.
 *
 * `state.json` 의 `failedCategories` 는 advance 시점에 굳는다. 2026-08-31 런에서는
 * advance 가 14:55:43 에 발사됐고 스코어카드가 15:10:00 에 실측값으로 다시 쓰였으며
 * 임계값 상향은 그보다 더 뒤였다. 스냅샷은 실패 7개를 말했지만 실제로는 10개였고,
 * 남아 있던 값은 디렉터가 스스로 폐기한 자체 추정치였다 (visualImpact 4.5 대 실측 2.8).
 *
 * `HANDOFF.md` §3 은 이걸 미해결 결함으로 적고 사람에게 재계산을 부탁했다.
 * 아래 테스트가 그 부탁을 검사로 바꾼 것을 지킨다.
 */
describe("스테일 실패 스냅샷", () => {
  const gateNode = Object.entries(realGraph.nodes).find(([, n]) => n.gate?.thresholds);
  const thresholds = gateNode[1].gate.thresholds;
  const scorecard = JSON.parse(
    fs.readFileSync(path.join(ROOT, gateNode[1].gate.scorecard), "utf8"),
  );

  /** 실측값 x 현재 임계값으로 계산한 진짜 실패 목록. */
  const realFailures = Object.fromEntries(
    Object.entries(thresholds)
      .filter(([k, th]) => scorecard.scores[k]?.value < th)
      .map(([k, th]) => [k, { value: scorecard.scores[k].value, threshold: th }]),
  );

  it("스냅샷이 비어 있으면 아무 문제도 보고하지 않는다", () => {
    expect(checkFailedCategoriesSnapshot(realGraph, { failedCategories: {} })).toBeNull();
  });

  it("스코어카드와 일치하는 스냅샷은 통과한다", () => {
    expect(
      checkFailedCategoriesSnapshot(realGraph, { failedCategories: realFailures }),
    ).toBeNull();
  });

  it("2026-08-31 런의 실제 스테일 스냅샷을 잡는다", () => {
    // 그때 state.json 에 굳어 있던 값 그대로. 디렉터 자체 추정치 + 상향 전 임계값.
    const stale = {
      visualImpact: { value: 4.5, threshold: 9 },
      artDirection: { value: 5.5, threshold: 9 },
      motionCoherence: { value: 5.8, threshold: 9 },
      typography: { value: 6, threshold: 8.5 },
      originality: { value: 6.5, threshold: 8.5 },
      narrativeClarity: { value: 7.5, threshold: 8 },
      mobile: { value: 4, threshold: 8 },
    };
    const problem = checkFailedCategoriesSnapshot(realGraph, { failedCategories: stale });
    expect(problem).not.toBeNull();
    // 값이 부풀려진 항목과, 스냅샷에서 통째로 빠진 항목을 둘 다 짚어야 한다.
    expect(problem).toContain("visualImpact");
    expect(problem).toContain("composition");
    expect(problem).toContain("작업 목록으로 쓰지 마세요");
  });

  it("실패가 하나 사라진 스냅샷도 잡는다", () => {
    const [dropped, ...rest] = Object.keys(realFailures);
    if (!rest.length) return; // 실패가 하나뿐이면 이 경우가 없다
    const partial = Object.fromEntries(rest.map((k) => [k, realFailures[k]]));
    expect(checkFailedCategoriesSnapshot(realGraph, { failedCategories: partial })).toContain(
      dropped,
    );
  });
});
