# Decisions

## Initial setup

- The workflow graph is initialized at `BOOTSTRAP`.
- Portfolio content and visual direction are not yet supplied; agents must not invent them.
- Runtime verification commands are intentionally unconfigured until an application exists.

## Repository audit (2026-08-31)

Findings from auditing the harness and repository state:

- The v1 harness had no execution layer: transitions, gate predicates, and
  iteration counting existed only as prose. state.json never left BOOTSTRAP
  while a Next.js scaffold, Hero, fonts, and an e2e gate were already built —
  implementation ran ahead of the graph with no recorded direction.
- prevent-premature-stop keyed on `state.active`, which nothing ever set:
  a deadlock that made the stop gate permanently inert.
- verify-builder.mjs was referenced only from agent frontmatter and never ran;
  its check list double-built the app (standalone build + e2e webServer build).
- graph.json and portfolio-build/SKILL.md carried two diverging copies of the
  graph; 8 of 19 nodes had no executor binding.
- performance/accessibility auditors were required to judge rendered scenes
  without any browser or measurement pipeline.

Existing scaffold code (src/, e2e/) predates any locked art direction. It is
treated as provisional: DIRECTION_JUDGE may keep, rework, or discard it.

## Graph engine v2 (2026-08-31)

- docs/portfolio/graph.json is the single graph source of truth. Each node
  declares executors (agents/skill/owner), required outputs (regex-checked
  docs), evidence directories, gate thresholds, iteration limits, and edges.
- scripts/graph.mjs is the single writer of state.json. It enforces outputs,
  evidence, gates, and verification tiers before every transition, journals
  every transition to journal.ndjson, and forces GOLDEN_FIX → STRUCTURAL_BRANCH
  after 3 failed gate iterations. Unit-tested in scripts/graph.test.mjs.
- Golden-gate scores are machine-read from docs/portfolio/scorecard.json;
  SCORECARD.md remains the human mirror.
- Verification is tiered in .claude/runtime.json: `builder` (lint, typecheck,
  unit tests) runs on frontend-builder stop via settings.json SubagentStop;
  `gate` (adds e2e, which builds production itself — no double build) runs once
  at REGRESSION via the engine.
- Rendered evidence comes from scripts/capture.mjs (production server,
  desktop 1440 / mobile 320, normal + reduced motion) into review/ dirs, which
  gate nodes require by file count.

## Content source directive (2026-08-31)

Portfolio content facts always come from the sibling repository
`../_jadewisemann`: facts from its `ref/` wiki (evidence grades A/B only,
entry point `ref/README.md`), positioning judgment from its `DESIGN.md`.
Every fact recorded in BRIEF.md/CONTENT.md must carry its source path.
This resolves the CONTENT_INVENTORY blocker "portfolio facts not supplied".

## Override: DESIGN.md §3 (2026-08-31)

`../_jadewisemann/DESIGN.md` §3 records the judgment "포트폴리오 사이트를
만들지 않는다" (strengths are invisible on screen; the visual track has low
odds). The owner explicitly overrides it for this repo: the site gets built.
The judgment's rationale is kept as an art-direction constraint — the site
must make the invisible visible (quality infrastructure, gates, verified
claims) rather than compete as a generic visual showpiece. Every other
judgment in that DESIGN.md remains binding.

## Direction lock (2026-08-31)

세 방향을 `docs/portfolio/directions/` 에 만들고 심사했다.

| 방향 | 합계 | 판정 |
|---|---:|---|
| A 계기판 | 64 / 80 | 탈락 |
| **B 이음선** | **71 / 80** | **채택** |
| C 비판정본 | 67 / 80 | 탈락 |

- 채택 사유는 점수 차가 아니라 **시각 충격의 출처**다. 이미지 자산이 0장인 조건에서
  A(정보 밀도)와 C(형식의 낯섦)는 이전 iteration 에서 이미 미달한 계열이고, B 는
  충격을 지면의 기하에서 구한다 — 절마다 두 칸의 폭 비율이 그 절의 수치다.
- 차용은 하나다: C 의 「지운 문장 전시」를 FestiFriends 역할 경계 절 **한 곳에만** 쓴다.
  그 절의 이음선이 0% 여서 C 의 오독 위험이 구조적으로 막힌다. A 에서는 차용 없음.
- 평균한 타협안을 만들지 않았다.
- 기존 스캐폴드(`src/`)는 폐기하지 않고 승계한다. 그 코드의 주석이 사라진 이전 런의
  아트 디렉션 · 디자인 시스템 · 모션 언어를 유일하게 보존하고 있었다 (문서는
  플레이스홀더로 초기화되어 있었다). `ART_DIRECTION.md` §3 의 절 번호는 기존 소스
  주석이 참조하는 번호(3.1 · 3.2 · 3.7 · 3.10 · 3.11)와 맞춰 다시 세웠다.
- 승계 판정: `Hero` · `GutterRail`(역할 축소) · `MeasurementBar` · `CodeBlock` ·
  `EvidenceNote` · `HarnessTable` · `DecisionBlock` · `DecisionIndex` · `HashFocus` 유지.
  신규는 `Seam` 과 `DirTree` 둘. 새 런타임 의존성은 최대 1개.

## Content inventory (2026-08-31)

- `BRIEF.md` · `CONTENT.md` 를 형제 저장소 `../_jadewisemann` 에서 추출해 채웠다.
  모든 행에 출처 경로와 근거 등급(A/B)이 있고, C·D 등급은 원장에 들어오지 못한다.
- 이 저장소는 공개(`jadewisemann/portfolio`)이므로 추출 시 두 가지를 뺐다:
  **PII 6종**(생년월일 · 전화 · 거주지 · 병역 · 학점 · 증명사진)과 **팀원 실명**.
  팀 구성은 역할 수로만 적는다. 이메일 · 블로그는 전환 지점으로 의도적으로 공개한다.
- 화면에 올릴 수 없는 것 12항목을 `CONTENT.md` §9 에 금지 목록으로 고정했고,
  빌드 산출물에서 기계 검사할 대상으로 지정했다 (`COMPONENT_REGISTRY.md` B5).
- 자산 제약이 아트 디렉션의 입력이 되었다: 프로젝트 스크린샷 · 영상이 **0장**이다.

## GOLDEN_REVIEW 1 판정과 디렉터 개정 (2026-08-31 → 09-01)

골든 슬라이스(S0+S1+S2)를 재캡처한 렌더 증거로 심사했고 **전 항목 미달**이다.
`scripts/graph.mjs` 가 `GOLDEN_REVIEW --fail--> GOLDEN_FIX` 로 전이했다 (iteration 1).

| 항목 | 점수 | 임계 | 심사자 |
|---|---:|---:|---|
| visualImpact | 2.8 | 9.0 | visual-critic |
| artDirection | 3.4 | 9.0 | visual-critic |
| composition | 2.9 | 9.0 | visual-critic |
| typography | 4.8 | 9.0 | visual-critic |
| originality | 3.8 | 8.5 | visual-critic |
| narrativeClarity | 7.2 | 8.5 | visual-critic |
| mobile | 4.4 | 8.5 | visual-critic |
| motionCoherence | 5.8 | 9.0 | motion-critic |
| interactionQuality | 5.2 | 8.5 | motion-critic |
| accessibility | 6.8 | 8.0 | accessibility-auditor |
| **performance** | **8.4** | 8.0 | performance-auditor — **유일한 통과** |

### 절차상의 기록

- `review/golden-slice/` 에 남아 있던 이전 런의 스크린샷은 **스테일**이었다 — 소스에 없는
  구조(칸별 산문)를 보여주고 있었다. 그것으로 심사했다면 존재하지 않는 지면을 심사했을
  것이다. **판정 직전 재캡처를 의무로 고정한다.**
- visual-critic 이 늦게 반환했으므로 최초 스코어카드는 디렉터 실측 추정치였고, 반환 후
  **비평가 실측값으로 대체**했다 (4.5/5.5/6.0/6.5/7.5/4.0 → 2.8/3.4/4.8/3.8/7.2/4.4).
  판정 결과는 동일하다. 디렉터 추정이 일관되게 관대했다는 사실을 기록으로 남긴다.
- `graph.json` 의 GOLDEN_REVIEW 임계값을 소유자 기준으로 상향했다: 시각·아트디렉션·모션·
  타이포·컴포지션 9.0 / 독창성·서사·인터랙션·모바일 8.5 / 성능·접근성 8.0. `composition`
  과 `interactionQuality` 키를 신설했다. 증거 파일 하한을 4 → 8 로 올렸다.

### 진단 — 화장품 문제가 아니다

방향 B 의 주장은 "충격을 지면의 기하에서 구한다"인데, 구현은 그 기하를 **문서 안의 삽화**로
만들었다. 실측:

- 1920 첫 뷰포트의 **58.3% 에 잉크가 0** (뷰포트 전체 잉크 2.48%).
- `.seam-line` 이 S1 `{x:494,h:272}` · S2 `{x:1180,h:233}` — 900px 뷰포트를 가르지 않는다.
- 지면에서 **가장 긴 수직선은 값을 인코딩하지 않는 `tree-line`**(h=733)이었고, 같은 절에서
  트리는 50/50, 절 머리는 87.5/12.5 로 **두 개의 모순된 분할**이 363px 간격으로 있었다.
- 히어로 `h1` 이 1440·1920 에서 동일하게 36px/544px — 데스크톱 레지스터가 없었다.
- 거터 레일 실잉크 **0.0089%** — §3.7 이 4.0 으로 기록한 실패(0.018%)의 절반.
- 320px 에서 이음선의 세로 위치가 비율이 아니라 **콘텐츠 길이**로 결정되었다.
- 모바일 시그니처 인터랙션이 **관측 불가능**했다 (중간 프레임이 최종 프레임과 바이트 동일).

### 디렉터 결정 6건 (코디네이터가 개정 권한을 디렉터에 확정)

1. **`MOTION_LANGUAGE.md` §5.1 개정.** 연속 스크롤 스크러빙은 계속 금지
   (`useScroll`/`useTransform`/`scrollYProgress` 기계 검사 유지). **IntersectionObserver 가
   만든 이산 상태가 참값 사이의 전환을 촉발하는 것은 허용**한다. 근거: §5.1 이 두려워한
   「값의 격하」는 움직임이 아니라 **임의의 중간값이 화면에 상주하는 것**에서 온다.
   스크럽은 화면의 44% 가 어떤 실측값도 아닌 상태를 오래 유지해 거짓 정밀도를 만든다.
   이산 전환은 모든 정지점이 참값이므로 그 위험이 없고, 중간 프레임은 값이 아니라
   **값의 변화**이며 그것(이전→이후)이 이 사이트의 주제다. motion-critic 이 독립적으로
   같은 결론에 도달했다.
2. **§4 의 320ms 단일 상한 폐기 → 시간적 위계.** 즉각 ≤120ms / 장면 내 200–420ms /
   장면 간 420–900ms / 정지 ≥200ms. 스태거 항목당 ≤60ms · 총 ≤240ms. 500ms 초과는
   장면 간 대역에서만. `--ease-spine` 신설. 사유: 단일 상한은 「어떤 전환은 숨을 쉬고
   어떤 장면은 거의 정지한다」는 대비를 **구조적으로 불가능**하게 만든다. 금지되는 것은
   느림이 아니라 **무구분한 느림**이다. 유지: 속성당 소유자 1명 · 영구 RAF 금지 ·
   GPU 친화 변환 · 오프스크린 정지 · 축소 모션은 설계된 대안.
3. **`SCENE_GRAPH.md` §0 「씬 사이의 전이는 없다」 삭제.** 전환은 1급 설계 대상이다.
   전이를 0개로 두면 페이지는 절의 목록이 되고, 실제로 그렇게 렌더되었다.
4. **component-scout 의 척추 반대를 기각.** 스카우트는 §3.7 의 거터 글리프 실패(시각적
   질량 부족)와 혼동했다. `directions/B-seam.md` §2 는 이음선이 "사이트 전체를 관통한다",
   §7 은 "이음선 자체가 내비게이션이다"라고 **이미 규정**했다 — 척추는 방향의 변경이
   아니라 **규정의 복원**이다. 스카우트는 승리 방향 스펙을 읽지 않았다.
5. **골든 슬라이스 범위 확장: S0+S1+S2 → +S7(0%) +S9(100%).** 이 방향의 시각 자원은
   비율의 **연속**인데 절이 둘이면 연속이 지각되지 않는다 — 방향이 증명될 수 없는 표본이다.
   0%·100% 는 §3.4 가 「가장 중요한 두 사실」로 지정한 값이고 176px 숫자를 담을 전폭
   슬롯을 유일하게 제공한다. 비율 수열 16.7% → 88% → 0% → 100%.
   **슬라이스를 전체 사이트로 부풀리지 않는다.**
6. **새 런타임 의존성 0개.** component-scout 결론대로 아무것도 들여오지 않는다.
   Motion 공식 문서에서 원리만 가져온다: 칩에 `layout="position"`, 묶음에 `LayoutGroup`.

### 구조 수정 지시 (GOLDEN_FIX 1)

- **이음선을 지면의 척추로.** `x = 비율 × 100vw`, 최소 `100vh`. 절 단위 968px 밴드와
  중앙 정렬 컬럼을 폐기한다 — 측정폭 34rem 은 **칸 안의 산문**에만 적용된다.
  색은 `--rule` (iteration 0 은 `--ink-3` 을 썼다). 값을 인코딩하지 않는 선이 척추보다
  길어서는 안 된다.
- **비율 인코딩을 하나로.** 6px 비율 띠 삭제(진행 바로 읽힌다), 분할 숫자와 이중 캡션
  폐기, 콜론을 포함한 한 문자열 `1 : 5` 를 척추 위에. 급수는 척추 높이에서 파생.
- **디스플레이 레지스터 신설.** 히어로 26/30/56/72px, 비율 라벨 40/96/176px.
  지면에서 가장 큰 글자는 **여전히 항상 비율**이다.
- **거터 레일 삭제.** 기호는 척추 머리로. 분포 장치는 절이 12개가 된 뒤에 다시 설계한다.
- **S2 재설계: 패널 하나.** 칸 31개가 제자리에서 다시 묶인다. 라벨 불변, 위치만 이동.
  이것이 커밋 `91b3363` 의 정확한 서술이다 — 파일은 그대로이고 폴더 구조가 바뀌었다.
- **모바일 자체 아트 디렉션.** 두 블록의 높이 비가 비율이고 최소 블록 높이를 둔다.
  320px 에서 `colA.h/(colA.h+colB.h)` 가 비율과 ±2%p 안에 드는지 기하로 검사한다.
  640px 뷰포트에서 678px 이동시키지 않는다 — 거리를 줄이는 것이 아니라 **다른 전환**을
  설계한다. 절당 스크롤 예산을 정한다.
- **축소 모션을 하이드레이션에서 떼어낸다** (`MOTION_LANGUAGE.md` §13.1 신설).
  실측: 축소 모션 사용자의 히어로가 커밋 후 192ms(6x 스로틀 1399ms) 동안 보이지 않았다 —
  정확히 「애니메이션이 로드에 실패한 화면」이다. `data-js` 와 같은 방식으로 첫 페인트
  전에 분기한다.
- **E1 을 시그니처 목록에서 삭제.** 한 번도 구현되지 않았다. 미구현을 시그니처로 세지 않는다.
- **fade-up 을 시그니처에서 강등** (C1 → H1). 진입은 유지하되 셋에 세지 않는다.
- **접근성 2건.** `EvidenceNote` 링크 히트 영역을 44px 로 (활자 급수는 13px 유지),
  포커스 링에서 `transition-colors` 제거 (`outline-color` 를 전이시킨다).
- **괘선 기판 대비 1.6:1 이상.** 1.18:1 은 보이지 않았고, 보이지 않는 증거는 증거가 아니다.
- **다크 테마 증거 0장.** 캡처 파이프라인에 다크를 추가한다 — 심사할 수 없는 상태였다.

### 사실 확인 (통과)

슬라이스의 모든 수치를 `../_jadewisemann/ref/` 에서 전수 확인했고 전부 등급 A 다:
52,182 LOC (`.ts` 249 + `.tsx` 198) · 커밋 81 + 머지 103 · 236파일 `91b3363` ·
6인 팀 (BE 3 · AI 1 · Infra 1 · FE 1) · `.java` 267 · FE+BE 동시 수정 6 · AI 트레일러 16 ·
7개 폴더 → 1개. 「7개 폴더」의 근거 문장은 야추에 대한 것이고 표는 탁구로 증명하는데,
그 치환은 화면에 밝혀져 있으므로 유지한다.
