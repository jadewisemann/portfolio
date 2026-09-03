/**
 * 한 장짜리 사이트(`/`)의 문구와 값입니다.
 *
 * 구성은 소유자 지시(2026-09-03)를 따릅니다 — **메인 · 스킬 · 프로젝트 · 이력**
 * 네 절을 이 순서로 세로로 쌓습니다. 참고한 형태는 aarab.me 입니다.
 *
 * 규칙은 `src/content/golden.ts` 와 같습니다:
 *   - 모든 사실은 `docs/portfolio/CONTENT.md` 에서만 가져옵니다. 여기에 없는 사실은
 *     화면에도 없습니다.
 *   - 각 항목에 출처 절 번호를 주석으로 남깁니다.
 *   - PII 6종과 팀원 실명은 옮겨 적지 않습니다 (`BRIEF.md` §5.2).
 *   - 금지 문구는 `src/forbidden-claims.test.ts` 가 기계로 막습니다.
 */

/** 스킬 숙련도. `ref/03_skills.md` 의 등급 정의이고 D 는 애초에 들어오지 않습니다. */
export type SkillLevel = "A" | "B" | "C";

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  A: "능숙 — 직접 설계 · 구현했고 코드로 설명할 수 있다",
  B: "사용 경험 — 부분적으로 다뤘다",
  C: "학습 중",
};

/** 절 하나의 머리말. 번호는 화면에 등폭으로 찍습니다. */
export interface SectionMeta {
  id: string;
  /** 내비게이션에 찍히는 짧은 이름. */
  nav: string;
  /** 절 머리말의 긴 이름. */
  title: string;
  /** 절이 무엇을 보여주는지 한 문장. */
  note: string;
}

/** 소유자 지시의 순서 그대로입니다. 내비게이션도 이 배열 하나만 읽습니다. */
export const SECTIONS: readonly SectionMeta[] = [
  {
    id: "intro",
    nav: "메인",
    title: "정유진",
    note: "프론트엔드 개발자",
  },
  {
    id: "skills",
    nav: "스킬",
    title: "무엇을 쓸 수 있는가",
    note: "숙련도 등급을 함께 적는다. 근거가 없는 기술은 목록에서 뺐다.",
  },
  {
    id: "projects",
    nav: "프로젝트",
    title: "무엇을 만들었는가",
    note: "세 개가 본류다. 자세한 구조와 코드 리딩은 각 프로젝트 페이지에 있다.",
  },
  {
    id: "experience",
    nav: "이력",
    title: "어디를 지나왔는가",
    note: "최근이 위다. 과정 · 프로젝트 · 자격을 한 줄로 세운다.",
  },
];

/* ------------------------------------------------------------------ 메인 */

/**
 * 첫 화면. 이름이 뷰포트를 지배하고 나머지는 두 줄입니다
 * (`CLAUDE.md` — "첫 페이지에서는 글자가 거의 없어야 해").
 *
 * 두 문장은 `CONTENT.md` §1 의 헤드라인 두 줄이고 등급 A 입니다.
 */
export const profile = {
  /** 화면에 크게 조판할 이름. */
  name: "정유진",
  /** 이름 옆의 라틴 표기. 등폭으로 작게 찍습니다. */
  handle: "jadewisemann",
  role: "프론트엔드 개발자",
  /** CONTENT.md §1 (등급 A) */
  lines: [
    "6인 팀의 프론트엔드를 혼자 맡아 실시간 멀티플레이 게임 플랫폼을 완성했다.",
    "리뷰어가 없었으므로, 품질은 리뷰 대신 테스트 · 린트 · 훅이 지키게 만들었다.",
  ],
  /**
   * 숫자 세 개. 전부 실측값이고 등급 A 이며, 분모가 되는 라벨을 함께 답니다 —
   * 분모 없는 수치는 이 사이트에 올리지 않습니다.
   */
  figures: [
    { value: "52,000", unit: "LOC", label: "YORR 프론트엔드 · 3.5주 · 본인 단독" },
    { value: "236", unit: "파일", label: "레이어 우선 → 도메인 우선 재편" },
    { value: "274", unit: "커밋", label: "Pookjayo · 팀 692 중 팀 내 최다" },
  ],
  source: "docs/portfolio/CONTENT.md §2.1 · §2.5 · §4.1",
} as const;

/* ------------------------------------------------------------------ 스킬 */

export interface SkillGroup {
  /** 영역 이름. CONTENT.md §6 표의 행 이름 그대로입니다. */
  area: string;
  items: readonly { name: string; level: SkillLevel }[];
}

/**
 * CONTENT.md §6 표 전체입니다. 등급 D 로 매겨진 것은 §6 의 ⚠️ 목록대로 전부 뺐습니다 —
 * Redux/RTK · Styled-Components · Storybook · TanStack Form · Biome · 실시간 통신 3종 ·
 * Firebase Realtime.
 */
export const skillGroups: readonly SkillGroup[] = [
  {
    area: "Core",
    items: [
      { name: "JavaScript (ES6+)", level: "A" },
      { name: "TypeScript", level: "A" },
      { name: "React 19", level: "A" },
      { name: "Next.js 15 App Router", level: "A" },
      { name: "HTML5 / CSS3", level: "A" },
    ],
  },
  {
    area: "상태 · 데이터",
    items: [
      { name: "Zustand", level: "A" },
      { name: "TanStack Query", level: "A" },
      { name: "Context API", level: "B" },
      { name: "Axios", level: "B" },
    ],
  },
  {
    area: "스타일 · UI",
    items: [
      { name: "Tailwind CSS v4", level: "A" },
      { name: "반응형 · 모바일 우선", level: "A" },
      { name: "Radix", level: "B" },
      { name: "shadcn/ui", level: "B" },
      { name: "Sass", level: "C" },
    ],
  },
  {
    area: "폼 · 검증 · 테스트",
    items: [
      { name: "Zod", level: "A" },
      { name: "Jest + RTL", level: "A" },
      { name: "React Hook Form", level: "B" },
      { name: "MSW", level: "B" },
    ],
  },
  {
    area: "서버 · 데이터",
    items: [
      { name: "Firebase Functions", level: "A" },
      { name: "Firestore 모델링", level: "A" },
      { name: "IndexedDB", level: "A" },
      { name: "Firebase Auth", level: "B" },
      { name: "Python (BS4 / Selenium)", level: "B" },
      { name: "SQL / RDB", level: "C" },
      { name: "Java / Spring Boot", level: "C" },
      { name: "Vue 3 / Pinia", level: "C" },
    ],
  },
  {
    area: "협업 · 품질",
    items: [
      { name: "Git / GitHub Flow", level: "A" },
      { name: "ESLint / Prettier", level: "A" },
      { name: "Husky / commitlint", level: "A" },
      { name: "PR · 이슈 템플릿", level: "A" },
      { name: "문서화", level: "A" },
    ],
  },
];

/**
 * 목록에서 뺀 것을 화면에 함께 적습니다. 조용히 자르지 않는 것이 이 사이트의 규율입니다
 * (CONTENT.md §6 의 ⚠️ 두 절).
 */
export const skillsDisclosure = [
  "근거 등급 D 인 기술은 목록에서 뺐다 — Redux/RTK · Styled-Components · Storybook · TanStack Form · Firebase Realtime.",
  "실시간 통신(WebSocket · STOMP · SSE)은 기술 이름으로 쓰지 않는다. YORR 안의 구현 사실로만 적는다.",
] as const;

/* -------------------------------------------------------------- 프로젝트 */

/**
 * 프로젝트 카드에 붙는 값. 이름 · 블러브 · 키워드 · 스크린샷은
 * `src/components/showcase/shots.ts` 의 `PROJECTS` 가 정본이고, 이 표는 거기에 없는
 * 기간 · 역할 · 스택 · 링크만 더합니다.
 */
export interface ProjectDetail {
  /** `PROJECTS` 의 `id` 와 같습니다. */
  id: string;
  period: string;
  /** 팀 구성. 사람 이름을 쓰지 않고 역할 수로만 적습니다. */
  team: string;
  role: string;
  stack: readonly string[];
  /** 짧은 사실 세 줄. 전부 등급 A 입니다. */
  facts: readonly string[];
  links: readonly { label: string; href: string }[];
}

export const projectDetails: readonly ProjectDetail[] = [
  {
    // CONTENT.md §2.1 · §2.3 · §2.4 · §2.5
    id: "yorr",
    period: "2026.07 — 2026.08 · 3.5주",
    team: "6명 · BE 3 · AI 1 · Infra 1 · FE 1",
    role: "프론트엔드 단독",
    stack: [
      "React 19",
      "TypeScript",
      "Vite",
      "TanStack Router",
      "Zustand",
      "Tailwind 4",
      "Three.js + Rapier3D",
      "Vitest",
      "Playwright",
    ],
    facts: [
      "커버리지 하한을 로컬 게이트로 세우고, 흔들리는 파일은 측정에서만 뺐다. 테스트 48개는 그대로 돈다.",
      "E2E 를 두 벌로 나눴다 — 소스를 검증하는 MSW 14스펙과 빌드 산출물을 검증하는 Playwright 4스펙.",
      "파일 236개를 레이어 우선에서 도메인 우선으로 옮기고, 도메인 사이의 단방향 의존을 순환 검사로 기계화했다.",
    ],
    links: [{ label: "코드 (공개 미러)", href: "https://github.com/jadewisemann/yorr" }],
  },
  {
    // CONTENT.md §3.1 · §3.2 · §3.4 · §3.5
    id: "festifriends",
    period: "2025.05 — 2025.07",
    team: "8명 · FE 5 · BE 2 · 디자이너 1",
    role: "PM · 형상 관리 · 프론트엔드",
    stack: [
      "Next.js 15",
      "React 19",
      "TypeScript",
      "Tailwind 4",
      "Zustand",
      "TanStack Query",
      "Zod",
      "Jest",
      "MSW",
    ],
    facts: [
      "팀 개발 환경을 혼자 세웠다 — 커스텀 ESLint 룰, 파일명 · 폴더명 린트 강제, commitlint, pre-push 게이트.",
      "같은 공연 카드가 세 화면에서 다른 조합으로 필요해, props 를 늘리는 대신 headless 컴파운드로 분해했다.",
      "무한 렌더링의 원인이 `useEffect` 의존성의 불안정한 참조임을 직접 진단하고 고쳤다.",
    ],
    links: [
      { label: "데모", href: "https://ff-frontend-rust.vercel.app/" },
      { label: "코드", href: "https://github.com/FestiFriends/ff_frontend" },
      {
        label: "무한 렌더링 수정 커밋",
        href: "https://github.com/FestiFriends/ff_frontend/commit/786efc5285bf72f1ac980659a3c269cb7e75f71d",
      },
    ],
  },
  {
    // CONTENT.md §4.1 · §4.2 · §4.3 · §4.5
    id: "pookjayo",
    period: "2025.03 — 2025.04",
    team: "5명 · 전원 FE",
    role: "팀장 · PM · 프론트엔드 구조 · 서버리스 함수 로직",
    stack: [
      "React 19",
      "Vite",
      "Tailwind 4",
      "Zustand",
      "Firebase Functions",
      "Firestore",
      "IndexedDB",
      "Python",
    ],
    facts: [
      "예약 한 건이 문서 6개를 바꾼다. 중복 예약 판정을 트랜잭션 안에서 읽고 검색 인덱스까지 같은 트랜잭션에서 갱신했다.",
      "결제 상태를 전이표로 선언하고 검증 후에만 바꿨다. PROCESSING 의 허용 전이에 자기 자신이 없어 중복 요청이 구조적으로 거부된다.",
      "메모리 → IndexedDB → 네트워크 2단 캐시를 스토어별 TTL 주입이 되는 팩토리로 만들었다.",
    ],
    links: [
      { label: "데모", href: "https://pookjayo.vercel.app/" },
      { label: "코드", href: "https://github.com/jadewisemann/Pookjayo" },
    ],
  },
];

/** 2군. 한 줄씩만 적습니다 (CONTENT.md §5). */
export const minorProjects = [
  {
    name: "neutropic",
    period: "2026.06",
    line: "2인 팀의 팀장 겸 프론트엔드 전담 (Vue 3). 설문 단계 이동과 입력 검증을 순수 함수로 분리해 테스트했다.",
  },
  {
    name: "videOn",
    period: "2025.01",
    line: "5인 팀. Web Components 로 컴포넌트 시스템을 직접 구현했다.",
  },
  {
    name: "morgorithm",
    period: "2026.03",
    line: "6인 알고리즘 스터디를 직접 설계하고 운영했다. 전원 승인이 있어야 병합되는 브랜치 보호를 걸었다.",
  },
] as const;

/**
 * 프로젝트 절에서 과장을 막는 문장. CONTENT.md §2.8 · §3.7 · §4.7 에서 화면에 함께
 * 적으라고 지정한 것만 옮깁니다.
 */
export const projectsDisclosure = [
  "YORR 는 3.5주 프로젝트다. 장기 운영 경험이 아니고, 백엔드는 팀원 담당이다.",
  "FestiFriends 의 실시간 채팅과 알림은 담당자가 따로 있었다. 본인 커밋은 0건이므로 완곡한 표현도 쓰지 않는다.",
  "Pookjayo 에는 자동화 테스트 코드가 없다. 격리 확인용 라우트를 직접 만들어 수동으로 확인했다.",
] as const;

/* ------------------------------------------------------------------ 이력 */

export type TimelineKind = "교육" | "과정" | "프로젝트" | "자격" | "활동";

export interface TimelineEntry {
  /** 정렬은 이 문자열의 사전순 역순으로 합니다 — `YYYY.MM` 로만 씁니다. */
  when: string;
  /** 기간이 있으면 화면에 이 문자열을 씁니다. 없으면 `when` 을 씁니다. */
  span?: string;
  kind: TimelineKind;
  title: string;
  detail?: string;
  /** 프로젝트 절의 카드로 보내는 앵커. */
  href?: string;
}

/** CONTENT.md §7 (교육 · 자격) 과 §2 ~ §5 (프로젝트 기간). 최근이 위입니다. */
export const timeline: readonly TimelineEntry[] = [
  {
    when: "2026.07",
    span: "2026.07 — 2026.08",
    kind: "프로젝트",
    title: "YORR — 모바일 실시간 멀티플레이 게임 플랫폼",
    detail: "6인 팀의 프론트엔드 단독",
    href: "#project-yorr",
  },
  {
    when: "2026.06",
    kind: "프로젝트",
    title: "neutropic",
    detail: "2인 팀의 팀장 겸 프론트엔드 전담",
  },
  {
    when: "2026.03",
    kind: "활동",
    title: "알고리즘 스터디 설계 · 운영",
    detail: "SSAFY · 팀장. 4명 중 3명이 SW 역량테스트 A형을 받았다.",
  },
  {
    when: "2026.01",
    kind: "자격",
    title: "SW 역량테스트 A+",
    detail: "SSAFY · 2026",
  },
  {
    when: "2026.01",
    span: "2026.01 — 재학",
    kind: "교육",
    title: "삼성청년SW아카데미 15기 · 비전공자 트랙",
  },
  {
    when: "2025.05",
    span: "2025.05 — 2025.07",
    kind: "프로젝트",
    title: "FestiFriends — 공연 동행 매칭 플랫폼",
    detail: "8인 팀의 PM · 형상 관리 · 프론트엔드",
    href: "#project-festifriends",
  },
  {
    when: "2025.04",
    span: "2025.04 — 2025.07",
    kind: "과정",
    title: "코드잇 스프린트 프론트엔드 단기 심화",
    detail: "수료",
  },
  {
    when: "2025.03",
    span: "2025.03 — 2025.04",
    kind: "프로젝트",
    title: "Pookjayo — 숙박 검색 · 예약 · 결제 플랫폼",
    detail: "5인 팀의 팀장 · PM · 서버리스 함수 로직",
    href: "#project-pookjayo",
  },
  {
    when: "2025.01",
    kind: "프로젝트",
    title: "videOn",
    detail: "5인 팀. Web Components 로 컴포넌트 시스템 구현",
  },
  {
    when: "2024.11",
    span: "2024.11 — 2025.04",
    kind: "과정",
    title: "이스트캠프 오르미 프론트엔드 4기",
    detail: "수료",
  },
  {
    when: "2024.08",
    kind: "교육",
    title: "인하대학교 화학과 졸업",
  },
  {
    when: "2023.10",
    kind: "자격",
    title: "OPIc IH",
    detail: "2023.10 취득 · 현재 만료",
  },
];
