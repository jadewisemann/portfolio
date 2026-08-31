// 골든 슬라이스(S0 · S1 · S2)의 문구와 값입니다. SCENE_GRAPH.md 2절이 정본입니다.
//
// 결정 변경 기록 (2026-08-31):
//   이전 런은 "이 저장소에는 개인 사실을 두지 않는다"로 결정하고 문구 주입 방식을
//   미정으로 남겼습니다. 그 결정은 CLAUDE.md 의 콘텐츠 지침으로 대체되었습니다 —
//   추출은 docs/portfolio/CONTENT.md 가 하고, 이 파일은 그 원장에서 화면에 올릴 것만
//   가져옵니다. 원장은 이미 이 저장소에 있으므로 정본이 둘로 갈라지지 않습니다.
//   대신 두 가지를 뺐습니다: **PII 6종**과 **팀원 실명**. 팀 구성은 역할 수로만 씁니다.
//
// 규칙:
//   - 모든 항목에 `source`(형제 저장소 기준 경로)와 `grade` 가 붙습니다.
//   - CONTENT.md 9절의 금지 문구는 src/forbidden-claims.test.ts 가 기계로 막습니다.
//   - 여기에 없는 사실은 화면에 없습니다.

import type { Grade } from "@/lib/reading";
import type { Ratio } from "@/lib/seam";
import type { Mark } from "@/lib/gutter";
import type { EvidenceLink } from "@/components/EvidenceNote";

export const MARK_LABELS: Record<Mark, string> = {
  built: "만들었다",
  blocked: "막았다",
  moved: "옮겼다",
  reverted: "되돌렸다",
  confirmed: "확인했다",
};

/** S0 — 히어로. DESIGN.md 1절 포지셔닝 v2 의 두 문장입니다. */
export const hero = {
  lines: [
    "6인 팀의 프론트엔드를 혼자 맡아 실시간 멀티플레이 게임 플랫폼을 완성했다.",
    "리뷰어가 없었으므로, 품질은 리뷰 대신 테스트 · 린트 · 훅이 지키게 만들었다.",
  ],
  standfirst:
    "아래의 모든 수치에는 분모와 근거 경로와 등급이 붙어 있다. 등급 없이 렌더할 수 있는 주장은 이 사이트에 없다.",
  source: "ref/20_evidence.md A행 · DESIGN.md §1",
} as const;

/**
 * 칸의 내용. **산문은 여기 오지 않습니다** — 12% 칸에서 부서지기 때문입니다.
 * 논지는 `lede` 에서 전폭으로 조판합니다 (src/components/Seam.tsx 의 설명 참고).
 */
type Column = {
  /** 상태의 이름. 비율 라벨의 분모 역할도 합니다. */
  heading: string;
  /** 등폭으로 조판할 짧은 사실. 어떤 비율에서도 부서지지 않는 길이로 씁니다. */
  facts: readonly string[];
};

export type SeamScene = {
  id: string;
  mark: Mark;
  title: string;
  /** 논지. 이음선 위에서 전폭으로 조판합니다. */
  lede: readonly string[];
  ratio: Ratio;
  /** 되돌릴 수 없는 경계인가 (ART_DIRECTION.md 3.3 — 2px). */
  hard?: boolean;
  a: Column;
  b: Column;
  grade: Grade;
  links: readonly EvidenceLink[];
};

/** S1 — 왜 혼자였나. 히어로 둘째 문장의 전제를 사실로 세웁니다. */
export const s1: SeamScene = {
  id: "yorr-alone",
  mark: "built",
  title: "6인 팀에서 프론트엔드는 한 명이었다",
  lede: [
    "약 52,000 LOC 를 3.5주에 구현했다. 리뷰해줄 프론트엔드 동료가 없었으므로, 회귀를 막는 장치를 직접 세웠다.",
    "백엔드는 팀원 담당이다. 본인의 프론트·백엔드 동시 수정은 6건이고 전부 프론트와 맞물린 부분이다. 3.5주 프로젝트이므로 장기 운영 경험이 아니다.",
  ],
  ratio: { a: 1, b: 5, aLabel: "FE 1", bLabel: "그 외 5" },
  a: {
    heading: "프론트엔드 — 본인 1명",
    facts: ["249 .ts · 198 .tsx", "2026-07 ~ 08 · 3.5주", "커밋 81 + 머지 103"],
  },
  b: {
    heading: "그 외 5명 — BE 3 · AI 1 · Infra 1",
    facts: ["Spring Boot · .java 267", "FE+BE 동시 수정 6건", "AI 페어 트레일러 16건"],
  },
  grade: "A",
  links: [
    { label: "jadewisemann/yorr (공개 미러)", href: "https://github.com/jadewisemann/yorr" },
  ],
};

/**
 * S2 — 구조 재편. 시그니처 씬입니다.
 *
 * 칸은 도메인 × 레이어입니다. **파일 이름은 지어내지 않았습니다** — 근거 문서에 파일
 * 목록이 없으므로, 실제로 문서에 있는 폴더 교차점만 칸으로 씁니다.
 */
export type TreeCell = { domain: string; layer: string };

export const treeCells: readonly TreeCell[] = [
  { domain: "landing", layer: "screens" },
  { domain: "landing", layer: "components" },
  { domain: "landing", layer: "model" },
  { domain: "landing", layer: "rendering" },
  { domain: "landing", layer: "__tests__" },
  { domain: "room", layer: "screens" },
  { domain: "room", layer: "components" },
  { domain: "room", layer: "api" },
  { domain: "room", layer: "domain" },
  { domain: "room", layer: "model" },
  { domain: "room", layer: "__tests__" },
  { domain: "yacht", layer: "rendering" },
  { domain: "pingpong", layer: "screens" },
  { domain: "pingpong", layer: "components" },
  { domain: "pingpong", layer: "api" },
  { domain: "pingpong", layer: "domain" },
  { domain: "pingpong", layer: "model" },
  { domain: "pingpong", layer: "rendering" },
  { domain: "pingpong", layer: "__tests__" },
  { domain: "duel", layer: "screens" },
  { domain: "duel", layer: "components" },
  { domain: "duel", layer: "domain" },
  { domain: "duel", layer: "model" },
  { domain: "auth", layer: "screens" },
  { domain: "auth", layer: "components" },
  { domain: "auth", layer: "api" },
  { domain: "auth", layer: "model" },
  { domain: "auth", layer: "__tests__" },
  { domain: "realtime", layer: "voice" },
  { domain: "realtime", layer: "__tests__" },
  { domain: "shared", layer: "shared" },
];

export const s2 = {
  id: "yorr-restructure",
  mark: "moved" as Mark,
  title: "파일 236개를 레이어 우선에서 도메인 우선으로 옮겼다",
  /*
    비율은 「게임 하나를 이해하려고 뒤져야 하는 폴더 수」입니다 — 7 에서 1 로 줄었습니다.
    근거 문서의 문장이 그대로 이 두 수입니다. 1 : 1 로 두었더니 96px 짜리 `1` 두 개가
    무엇의 1 인지 말하지 않아서, 실제로 측정된 쌍으로 바꿨습니다.
  */
  ratio: { a: 7, b: 1, aLabel: "폴더 7", bLabel: "폴더 1" } satisfies Ratio,
  lede: [
    "게임 하나를 이해하려면 7개 폴더를 동시에 뒤져야 했다. 아래 표에서 탁구가 7개 폴더에 걸쳐 있는 것을 직접 셀 수 있다. components/ 한 폴더에는 랜딩 카드와 게임판과 로비 패널과 공용 버튼이 평평하게 섞여 있었다.",
    "236개를 옮긴 뒤로는 게임 하나를 추가하는 일이 폴더 하나를 만드는 일이 되었다. 도메인 사이의 단방향 의존은 순환 검사로 기계화했다.",
  ],
  a: {
    heading: "그때 — 레이어 우선",
    facts: ["최상위 폴더 9개", "게임 하나가 7곳에"],
  },
  b: {
    heading: "지금 — 도메인 우선",
    facts: ["도메인 8개", "check:cycles"],
  },
  grade: "A" as Grade,
  links: [
    { label: "jadewisemann/yorr (공개 미러)", href: "https://github.com/jadewisemann/yorr" },
  ],
  /** 토글 라벨. 기능은 축소 모션에서도 남습니다 (MOTION_LANGUAGE.md 13절). */
  toggle: {
    label: "구조 보기",
    layerFirst: "레이어 우선",
    domainFirst: "도메인 우선",
  },
  /** 줄인 것을 화면에 밝힙니다. 조용히 자르지 않습니다. */
  disclosure: [
    "표시한 것은 도메인 × 레이어 칸 31개다. 실제로 옮긴 파일은 236개이고, 파일 목록은 근거 문서에 없으므로 지어내지 않았다.",
    "근거 문서의 트리는 발췌라서 yacht 는 rendering 한 칸만 확인된다. 표가 구조를 다 담지는 않는다.",
    "순환 검사와 커버리지 하한은 로컬 게이트다. 그 프로젝트의 Jenkins 파이프라인에는 두 명령이 없다.",
  ],
  commit: "커밋 91b3363 — refactor: 프론트엔드 도메인 우선 구조 재편 및 테스트 분리 (236파일)",
} as const;
