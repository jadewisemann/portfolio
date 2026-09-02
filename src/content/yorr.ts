// `/projects/yorr` 의 문구와 값입니다. 정본은 `docs/portfolio/CONTENT.md` §2 이고,
// 여기서는 화면에 올릴 것만 가져옵니다 — `src/content/golden.ts` 와 같은 방식입니다.
//
// 규칙 (golden.ts 와 동일):
//   - 모든 항목에 `source`(형제 저장소 기준 경로)와 `grade` 가 붙습니다.
//   - CONTENT.md 9절의 금지 문구는 src/forbidden-claims.test.ts 가 기계로 막습니다
//     (그 테스트는 src 전체를 재귀로 훑으므로 이 파일도 자동으로 검사 대상입니다).
//   - 여기에 없는 사실은 화면에 없습니다. 폴더 이름 · 파일 이름을 지어내지 않습니다.
//   - 표현 제약(CONTENT.md §2.3 경고): 커버리지 하한은 로컬 게이트입니다. "CI 가
//     강제한다"는 쓰지 않습니다 — Jenkins 는 커버리지를 끈 `npm test` 만 돌립니다.

import type { Grade } from "@/lib/reading";
import type { EvidenceLink } from "@/components/EvidenceNote";

export type Fact = { label: string; value: string; source: string; grade: Grade };
export type Claim = { text: string; source: string; grade: Grade };

const YORR_MIRROR: EvidenceLink = {
  label: "jadewisemann/yorr (공개 미러)",
  href: "https://github.com/jadewisemann/yorr",
};

/** §2.1 — 개요. */
export const overview = {
  what: {
    label: "무엇",
    value: "휴대폰을 컨트롤러로 쓰는 모바일 실시간 멀티플레이 게임 플랫폼 (야추 · 탁구 · 듀얼)",
    source: "ref/projects/yorr.md §1",
    grade: "A",
  },
  period: {
    label: "기간",
    value: "2026-07-21 ~ 2026-08-13 (약 3.5주)",
    source: "ref/20_evidence.md A행",
    grade: "A",
  },
  team: {
    label: "팀",
    value: "6명 — BE 3 · AI 1 · Infra 1 · FE 1(본인 단독)",
    source: "ref/projects/yorr.md 개요표 · ref/20_evidence.md A행",
    grade: "A",
  },
  commits: {
    label: "본인 커밋",
    value: "81건(비-머지) + 103건(develop 통합 머지)",
    source: "ref/projects/yorr.md 개요표 (2026-08-13 실측)",
    grade: "A",
  },
  loc: {
    label: "프론트 코드량",
    value: "약 52,000 LOC (.ts 249파일 + .tsx 198파일)",
    source: "ref/projects/yorr.md 개요표 · §5 이력서 문장",
    grade: "A",
  },
  stack: {
    label: "스택 (본인 담당)",
    value:
      "React 19 · Vite 8 · TypeScript 7 · TanStack Router · Zustand · Tailwind 4 · motion · Three.js 0.180 + Rapier3D · WebSocket · WebRTC(음성)",
    source: "ref/projects/yorr.md 개요표",
    grade: "A",
  },
  tooling: {
    label: "품질 도구",
    value: "Biome · Vitest 4 + v8 coverage · Playwright · MSW · dpdm",
    source: "ref/projects/yorr.md 개요표",
    grade: "A",
  },
} satisfies Record<string, Fact>;

export const overviewLinks: readonly EvidenceLink[] = [
  YORR_MIRROR,
  { label: "DESIGN.md §2 (공개 근거)", href: "https://github.com/jadewisemann" },
];

/** §2.2 — `frontend/docs/architecture.md` 에 본인이 적은 설계 판단 3개. */
export const principles: readonly {
  id: string;
  title: string;
  body: string;
  source: string;
  grade: Grade;
}[] = [
  {
    id: "server-authority",
    title: "서버 상태를 화면으로",
    body: "상태의 최종 권위자는 서버다. 클라이언트는 서버가 보낸 상태를 그리는 쪽이고, 서버의 응답과 어긋난 로컬 상태를 오래 들고 있지 않는다.",
    source: "ref/projects/yorr.md §1",
    grade: "A",
  },
  {
    id: "judged-events",
    title: "센서를 게임 입력으로",
    body: "휴대폰 센서가 만드는 원시값을 그대로 서버로 보내지 않는다. 클라이언트가 먼저 판정하고, 판정된 이벤트만 전송한다 — 스윙인지 아닌지, 방향이 어느 쪽인지를 결정한 뒤의 결과다.",
    source: "ref/20_evidence.md A행 (커밋 a83c6fe · c0b556c)",
    grade: "A",
  },
  {
    id: "local-presentation",
    title: "연출은 로컬에서",
    body: "3D 물리 · 진동 · 소리는 전부 클라이언트가 맡는다. 서버는 판정에만 관여하고, 그 판정을 느끼게 만드는 연출은 네트워크를 왕복하지 않는다.",
    source: "ref/projects/yorr.md §1",
    grade: "A",
  },
];

export const principlesLinks: readonly EvidenceLink[] = [YORR_MIRROR];

/** §2.3 — 커버리지 래칫. 이 사이트의 핵심 소재다. */
export const coverage = {
  floors: [
    { metric: "statements", floor: "96", measured: "96.33" },
    { metric: "branches", floor: "91", measured: "91.94" },
    { metric: "functions", floor: "96", measured: "96.63" },
    { metric: "lines", floor: "98", measured: "98.40" },
  ] satisfies readonly { metric: string; floor: string; measured: string }[],
  floorSource: {
    text: "frontend/vitest.config.ts 에 설정한 하한과, 그 시점의 실측값이다.",
    source: "frontend/vitest.config.ts 인용 → ref/projects/yorr.md §3.1",
    grade: "A",
  } satisfies Claim,
  denominator: {
    text: "분모는 `include: ['src/**/*.{ts,tsx}']` 로 설계했다 — v8 커버리지는 테스트가 실제로 import 한 파일만 센다. 그래서 어떤 테스트도 한 번도 불러오지 않은 소스 파일은 분자에서 빠지는 대신 분모에서도 함께 빠진다. 실행되지 않은 코드가 성적을 깎지 않는 대신, 그 파일이 실제로 안전한지는 이 숫자가 보증하지 않는다.",
    source: "frontend/vitest.config.ts 주석 · ref/20_evidence.md A행",
    grade: "A",
  } satisfies Claim,
  oscillation: {
    text: "`World.ts` 의 렌더 루프는 `performance.now()` 로 실제 프레임 간격을 재고, 그 값이 accumulator 반복 횟수와 clamp 분기를 좌우한다. 그래서 이 파일 하나의 branches 커버리지가 실행할 때마다 71.71%에서 84.84% 사이를 오간다 — 코드가 바뀌지 않아도 측정값이 흔들린다.",
    source: "ref/projects/yorr.md §3.1",
    grade: "A",
  } satisfies Claim,
  identification: {
    text: "흔들림의 원인을 특정한 방법은 같은 테스트를 두 번 실행해 비교하는 것이었다 — 전역 branches 가 한 번은 90.48%, 다른 한 번은 91.43%로 나왔다. 코드가 아니라 시계가 흔들림의 원인이라는 뜻이다.",
    source: "frontend/vitest.config.ts 주석 · ref/20_evidence.md A행",
    grade: "A",
  } satisfies Claim,
  rejectedAlternative: {
    text: "먼저 검토한 대안은 파일별 glob 하한을 따로 거는 것이었다. 그러나 그 방식은 전역 분모에서 해당 파일을 빼주지 않는다는 것을 확인하고 기각했다 — 흔들리는 파일 하나 때문에 전역 하한이 계속 실패하는 구조는 그대로 남는다.",
    source: "frontend/vitest.config.ts 주석",
    grade: "A",
  } satisfies Claim,
  decision: {
    text: "선택한 조치는 이 파일을 측정에서만 제외하는 것이다. 검증에서 빼는 것이 아니다 — `World.ts` 를 다루는 테스트 48개는 그대로 돌며 물리 거동을 계속 검증한다. 빠지는 것은 흔들리는 숫자뿐이다.",
    source: "frontend/vitest.config.ts 주석",
    grade: "A",
  } satisfies Claim,
  deferred: {
    text: "근본 해결책은 `World.ts` 가 시간을 인자로 주입받고, 테스트가 그 자리에 가짜 시계를 넣는 것이다. 이것은 렌더 루프 자체를 고치는 일이라 3.5주 안에 끝내지 못했고, 별도 작업으로 유예했다.",
    source: "frontend/vitest.config.ts 주석",
    grade: "A",
  } satisfies Claim,
  localGate: {
    text: "이 하한은 로컬 게이트다. Jenkins 파이프라인은 커버리지 계측을 끈 `npm test` 만 돌린다 — 하한을 넘기지 못한 커밋이 파이프라인에서 저절로 막히지는 않는다.",
    source: "ref/projects/yorr.md §4.2",
    grade: "A",
  } satisfies Claim,
};

export const coverageLinks: readonly EvidenceLink[] = [YORR_MIRROR];

/** §2.4 — E2E 2단 하네스. */
export const e2e = {
  scale: {
    text: "18개 스펙 — mock 14개 + real 4개.",
    source: "ref/20_evidence.md A행 (§4.3 정정: 17 → 18)",
    grade: "A",
  } satisfies Claim,
  whyTwo: {
    text: "두 벌이 필요한 이유는 프로덕션 빌드에서 MSW 가 컴파일 아웃되기 때문이다. 소스 코드를 검증하는 벌은 MSW 로 API 를 흉내 내고, 빌드 산출물을 검증하는 벌은 Playwright 라우트 페이크를 쓴다 — 둘 중 하나만으로는 다른 한쪽이 무엇을 실제로 실행하는지 확인할 수 없다.",
    source: "ref/projects/yorr.md §3.2",
    grade: "A",
  } satisfies Claim,
  contract: {
    text: "두 벌 사이의 어긋남을 막는 것은 `contract.ts` 다. 와이어 계약이 바뀌면 두 하네스가 같은 파일을 참조하고 있으므로 테스트 인프라 쪽이 먼저 깨진다.",
    source: "ref/projects/yorr.md §3.2",
    grade: "A",
  } satisfies Claim,
  projects: {
    text: "실행 대상은 Playwright 프로젝트 4종이다 — mobile-chrome(Pixel 7) · mobile-safari(iPhone 15) · mobile-320 · desktop-chrome.",
    source: "ref/projects/yorr.md §3.2",
    grade: "A",
  } satisfies Claim,
  narrowWidth: {
    text: "`narrow-width.spec.ts` 는 스크린샷을 비교하지 않는다. 요소의 실제 위치와 크기를 읽어 넘침을 판정하고, 넘친 요소의 이름을 짚어 보고한다.",
    source: "ref/20_evidence.md A행",
    grade: "A",
  } satisfies Claim,
};

export const e2eLinks: readonly EvidenceLink[] = [YORR_MIRROR];

/** §2.5 — 도메인 우선 구조 재편. */
export const restructure = {
  scale: {
    text: "236개 파일을 옮긴 재편이다.",
    source: "ref/20_evidence.md A행",
    grade: "A",
  } satisfies Claim,
  before: {
    text: "이전 구조는 레이어 우선이었다. 야추 하나를 이해하려면 7개 폴더를 동시에 뒤져야 했다. `components/` 폴더 하나에는 랜딩 카드와 게임판과 로비 패널과 공용 버튼이 평평하게 섞여 있었다.",
    source: "ref/projects/yorr.md §3.3 (본인 architecture.md 인용)",
    grade: "A",
  } satisfies Claim,
  after: {
    text: "재편 이후로는 게임 하나를 추가하는 일이 폴더 하나를 만드는 일이 되었다.",
    source: "ref/projects/yorr.md §3.3",
    grade: "A",
  } satisfies Claim,
  machineCheck: {
    text: "도메인 사이의 의존이 한 방향으로만 흐르는지는 `dpdm --circular`(`npm run check:cycles`)로 기계 검사한다.",
    source: "ref/20_evidence.md A행",
    grade: "A",
  } satisfies Claim,
  localGate: {
    text: "`check:cycles` 도 Jenkinsfile 에는 없다. 로컬에서 실행하는 검사다.",
    source: "ref/projects/yorr.md §4.2",
    grade: "A",
  } satisfies Claim,
  commit: "커밋 91b3363",
};

export const restructureLinks: readonly EvidenceLink[] = [YORR_MIRROR];

/** §2.6 — 롤백 판단. */
export const rollback = {
  text: "본인이 작성한 404파일 규모 리팩터링이 배포 회귀를 일으켰다. 원인을 되짚어 롤백을 판단하고 직접 실행했다 — 리팩터링을 밀어붙이는 대신 되돌리는 쪽을 선택했다.",
  source: "ref/20_evidence.md A행 (커밋 8f9f52f · d84c6d4)",
  grade: "A",
} satisfies Claim;

export const rollbackLinks: readonly EvidenceLink[] = [YORR_MIRROR];

/** §2.8 — 과장 금지. 각주가 아니라 본문과 같은 무게로 싣는다. */
export const limits: readonly Claim[] = [
  {
    text: "3.5주짜리 프로젝트다. 장기 운영 경험이 아니다.",
    source: "ref/projects/yorr.md §6",
    grade: "A",
  },
  {
    text: "백엔드(Spring Boot, .java 267파일)는 팀원 담당이다. 본인의 프론트·백엔드 동시 수정은 6건이고, 전부 프론트와 맞물린 부분이다.",
    source: "ref/projects/yorr.md §6",
    grade: "A",
  },
  {
    text: "본인의 비-머지 커밋 81건 중 16건에 Co-Authored-By: Claude 트레일러가 있다.",
    source: "ref/projects/yorr.md §6",
    grade: "A",
  },
  {
    text: "커버리지 96%는 본인이 정한 분모 기준 위에서 나온 숫자다. 위 커버리지 절에서 그 분모 설계를 함께 설명한 이유가 이것이다 — 분모를 빼고 숫자만 읽으면 의미가 없다.",
    source: "ref/projects/yorr.md §6",
    grade: "A",
  },
  {
    text: "`s15-Yorr` 조직 저장소는 비어 있다. 공개된 근거는 이 페이지가 링크하는 개인 미러뿐이다.",
    source: "ref/projects/yorr.md §6 · DESIGN.md §2",
    grade: "A",
  },
];

export const limitsLinks: readonly EvidenceLink[] = [YORR_MIRROR];
