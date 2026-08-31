import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { hero, s1, s2, treeCells } from "@/content/golden";

// CONTENT.md 9절의 게이트입니다 (COMPONENT_REGISTRY.md B5).
//
// 왜 기계로 막나: 금지 목록은 12항목이고, 그중 절반은 **이전 이력서에 실제로 적혀 있던
// 문장**입니다. 사람의 주의력으로 막는 규칙은 문구를 고칠 때마다 다시 무너집니다.
// 근거 등급이 낮은 주장은 타입이 막고(`Grade = "A" | "B"`), 문구는 이 게이트가 막습니다.
//
// 주석은 검사 전에 걷어냅니다 — 이 저장소의 주석은 "이 문장을 쓰지 않는다"를 자주
// 인용하고, grep 은 사용과 언급을 구분하지 못합니다 (motion-ownership.test.ts 와 같은 이유).

function stripComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const files = readdirSync("src", { recursive: true, encoding: "utf8" })
  .map((p) => `src/${p.replaceAll("\\", "/")}`)
  .filter((p) => /\.(ts|tsx)$/.test(p) && !p.includes(".test."))
  .map((path) => ({ path, text: stripComments(readFileSync(path, "utf8")) }));

function hits(pattern: RegExp): string[] {
  const found: string[] = [];
  for (const { path, text } of files) {
    text.split("\n").forEach((line, i) => {
      if (pattern.test(line)) found.push(`${path}:${i + 1}  ${line.trim()}`);
    });
  }
  return found;
}

/** CONTENT.md 9절. 번호는 ref/20_evidence.md 의 D 번호입니다. */
const FORBIDDEN: readonly { id: string; pattern: RegExp }[] = [
  { id: "D1 실시간 채팅 구축", pattern: /채팅[^.\n]{0,12}(구축|구현|개발)/ },
  { id: "D2 SSE 알림 구현", pattern: /SSE[^.\n]{0,20}(구축|구현|개발)/ },
  { id: "D3 백엔드 경험", pattern: /백엔드\s*(경험|개발자)|풀스택/ },
  { id: "D4 오픈소스 기여", pattern: /오픈\s?소스\s*기여/ },
  { id: "D5 무결성 100%", pattern: /무결성\s*100\s*%|위반\s*0\s*건/ },
  { id: "D7 검색 95% 단축", pattern: /95\s*%\s*단축|2초\s*→\s*100ms/ },
  { id: "D8 스크롤 성능 90%", pattern: /스크롤\s*성능\s*90/ },
  { id: "D9 타입 에러 0건", pattern: /타입\s*에러\s*0\s*건/ },
  { id: "D10 부작용 0%", pattern: /부작용\s*0\s*%/ },
  { id: "D11 Lighthouse 90점", pattern: /Lighthouse/i },
  { id: "D12 120ms→18ms", pattern: /120ms\s*→\s*18ms|60\s*FPS\s*구현/ },
  { id: "D13 인지 속도 40%", pattern: /인지\s*속도\s*40/ },
  { id: "D15 메시지 병합 큐", pattern: /메시지\s*병합\s*큐/ },
  { id: "D16 오디오 버퍼 누수", pattern: /오디오\s*버퍼/ },
  { id: "D17 지수 백오프", pattern: /지수\s*백오프/ },
  { id: "D18 멱등성 키", pattern: /멱등성\s*키/ },
  { id: "D19 MSW 지연 에뮬레이션", pattern: /지연\s*에뮬레이션/ },
  { id: "D21 시큐어 코딩 가이드", pattern: /시큐어\s*코딩/ },
  { id: "D23 잘못된 FSM 상태명", pattern: /\bPENDING\b|\bCONFIRMED\b|\bFAILED\b/ },
  { id: "D24 한글 자모 분리", pattern: /자모\s*(분리|분해)/ },
  { id: "D25 Trie", pattern: /\bTrie\b/ },
  { id: "D27 O(1) 로 단축", pattern: /O\(1\)/ },
  { id: "D26 정교한 접근 제어", pattern: /정교한\s*접근\s*제어/ },
  { id: "D28 마감 16시간 전", pattern: /마감\s*16시간/ },
  { id: "D29 전원 백준 골드", pattern: /전원\s*백준|백준\s*골드/ },
  { id: "CI 가 강제한다", pattern: /CI\s*(가|에서)\s*강제/ },
  { id: "비전공이지만", pattern: /비전공이지만/ },
];

/** 이 저장소 고유 금지 (BRIEF.md 5.2). 공개 저장소이므로 기계로 막습니다. */
const PRIVACY: readonly { id: string; pattern: RegExp }[] = [
  { id: "전화번호", pattern: /01\d[-\s]?\d{3,4}[-\s]?\d{4}/ },
  { id: "생년월일", pattern: /19\d{2}[-.]\d{2}[-.]\d{2}/ },
  { id: "학점", pattern: /\b[0-4]\.\d{2}\s*\/\s*4\.[05]0?\b/ },
];

describe("금지 문구", () => {
  test("검사 대상 파일이 실제로 발견된다", () => {
    // 이 단정이 없으면 glob 이 0개를 돌려줄 때 아래 모든 검사가 조용히 통과합니다.
    expect(files.length).toBeGreaterThan(5);
    expect(files.some((f) => f.path.startsWith("src/content/"))).toBe(true);
  });

  test.each(FORBIDDEN)("$id 가 소스에 없다", ({ pattern }) => {
    expect(hits(pattern)).toEqual([]);
  });

  test.each(PRIVACY)("$id 가 소스에 없다", ({ pattern }) => {
    expect(hits(pattern)).toEqual([]);
  });
});

describe("화면에 올리는 값의 규율", () => {
  test("모든 이음선 절에 근거 링크와 등급이 있다", () => {
    for (const scene of [s1, s2]) {
      expect(scene.links.length).toBeGreaterThan(0);
      expect(["A", "B"]).toContain(scene.grade);
      // 분모 없는 수치를 만들 수 없게 라벨을 필수로 둡니다.
      expect(scene.ratio.aLabel.length).toBeGreaterThan(0);
      expect(scene.ratio.bLabel.length).toBeGreaterThan(0);
    }
  });

  test("모든 근거 링크가 절대 URL 이고 금지 대상이 아니다", () => {
    for (const link of [...s1.links, ...s2.links]) {
      expect(link.href).toMatch(/^https:\/\//);
      // 2026-08-31 확인 시 404. DESIGN.md 2절이 금지했습니다.
      expect(link.href).not.toContain("s15-Yorr");
      // 커밋 중복 집계를 만드는 개인 포크.
      expect(link.href).not.toContain("ff_frontend__jade");
    }
  });

  test("히어로는 두 문장이다", () => {
    expect(hero.lines).toHaveLength(2);
  });

  test("트리 칸이 근거 문서의 도메인 목록 안에 있다", () => {
    // 도메인 이름을 지어내지 않았는지 확인합니다 (CONTENT.md 2.5).
    const known = new Set([
      "landing",
      "room",
      "yacht",
      "pingpong",
      "duel",
      "auth",
      "realtime",
      "shared",
    ]);
    for (const cell of treeCells) expect(known).toContain(cell.domain);
    expect(treeCells).toHaveLength(31);
  });
});
