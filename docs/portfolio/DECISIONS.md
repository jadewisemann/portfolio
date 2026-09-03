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

## Structural branch (2026-08-31)

`GOLDEN_FIX` was abandoned at iteration 1 and the graph advanced on `exhausted`.
The reason is `CLAUDE.md`'s own rule: a visual-impact score below about 5 means the
concept is wrong, not that the spacing is wrong. The measured score was **2.8 / 9.0**,
and 1 of 11 categories passed. Patching failure categories cannot rescue that.

The diagnosis, which the owner then confirmed in stronger terms: **이음선 (Seam) is an
editorial page system** — rules, ratio labels, two columns, a symbol vocabulary. A
document is what that concept *is*. No amount of tuning escapes it.

### Four rounds were rendered and rejected

Each round is on disk. The pixels, not the prose, are why each died.

| Round | Routes | Evidence | Why it died |
|---|---|---|---|
| 1 · text-forward | `/c1` `/c2` `/c3` | `review/rejected/01-text/` | Sentences, readouts, a headline at 149px. Still a document, in bigger type |
| 2 · wordless | `/d1` `/d2` `/d3` | `review/rejected/02-flat/` · `review/wordless/` | Owner: 셋 다 약하다. Flat, quiet, ink on paper |
| 3 · mechanisms in 3D | never built | — | Halted mid-build by the owner's correction below |
| 4 · screenshot showcase | `/f1` `/f2` `/f3` | `review/showcase/` | `/f1` has one good frame at 35% scroll and a blank one at 55%; `/f2` is an ordinary three-column card list; `/f3` puts everything in a narrow centre column with empty sides |

### What the owner settled, and it is binding

> 포트폴리오는 내 프로젝트를 설명하는 게 아니야. 그냥 뭘 했는지 미적으로 보여주는 거지.
> 키워드랑 프로젝트 설명이랑 스크린샷 같은 것만 두고, 거기서 별도 페이지에서 아키텍처나
> 코드 리딩을 보고 하는 구조야.

- **Landing** — keywords, a short project blurb, screenshots, presented aesthetically in
  3D. The first viewport carries the name and nothing else
  (첫 페이지에서는 글자가 거의 없어야 해).
- **Per-project pages** — architecture and code reading. Depth lives one click away.
- **3D is presentation, not explanation.** It is how the screenshots and keywords are
  shown, never a way to animate an architecture diagram.
- **Finished, now.** 스크린샷은 그냥 진짜 끼워넣는거고 있던 없던 핑계가 안 되. 완성이 되어
  있는 느낌이어야 함. An image slot is a **frame**, not a placeholder waiting to be
  filled: it must read as finished while holding a plain field. "The screenshots aren't
  in yet" is not a defence and must not shape the work.

### The detour, named so it is not restarted

An earlier `CLAUDE.md` said the engineering mechanisms were the visual material — the
coverage ratchet, the payment FSM, the two-tier cache, drawn as things that operate. It
followed from `CONTENT.md` §8 recording zero images, and it was a way around a constraint
that no longer holds, since the owner supplies screenshots. The owner's verdict:
**과하게 어려운 일을 하려고 노력 중이었구나.** A mechanism belongs on a project page, in
prose and diagrams, for someone who clicked through. `CLAUDE.md` now records both failure
modes — the document, and the mechanism rendering — with the shape of each.

### What dies with the seam

- `ART_DIRECTION.md` §3.3 · §3.4 · §3.5 · §3.6 · §4 · §4.1 · §5 — spine, ratio label, the
  two cells, the fixed section format, the scene→ratio table, the slice range, the mobile
  axis swap. All exist only to serve 이음선.
- `DESIGN_SYSTEM.md` §6's four `--seam-*` tokens; `--text-ratio` and the rule
  「지면에서 가장 큰 글자는 항상 비율이다」; §2's `--ground-sub` clause for the seam's right
  cell, which also resolves §3's recorded contradiction about `.seam-col-b`.
- `MOTION_LANGUAGE.md` §12's SP1 and SP2. G1 was already dead — the gutter rail was deleted
  in `ART_DIRECTION.md` §3.7 for carrying 0.0089% real ink — and is removed from the table.
- `SCENE_GRAPH.md`'s ratio annotations. The scene list survives; its ratio column does not.

Not everything goes. `ART_DIRECTION.md` §3.13 (four colour roles), §3.14 (no syntax
highlighting), §3.15, §3.16 and §6 were not the cause of the failure and are kept.

### Two engine changes made in the same branch

1. **`STRUCTURAL_BRANCH` now requires pixels.** It gated on the string `## Structural
   branch` in this file and nothing else — the node you reach *because the concept was
   wrong* let you pick the replacement concept on paper, which is exactly how
   `ART_DIRECTION_BRANCH` produced a 2.8. It now requires nine PNGs in `review/structural/`,
   three of them at 320px, and this entry citing `review/structural/`. Three tests in
   `scripts/graph.test.mjs` fail if anyone loosens it.
2. **3D is permitted, with conditions.** `CLAUDE.md`'s motion ownership table already
   allowed Three.js for explicit 3D scenes while `MOTION_LANGUAGE.md` §1.4 forbade it
   outright, and nothing decided which won. §1.4, §6 and §8 are revised: the flat default
   holds for page layout, geometry may carry depth inside a declared scene, and the test
   for which is which is whether the depth encodes a fact or decorates a surface. Four
   conditions attach — dynamic import off the first-paint path, designed static
   alternatives for no-WebGL/no-JS/reduced-motion, a keyboard path beside every pointer
   drag, and if a scene drops the performance gate the scene goes rather than the
   threshold.

### Measurement, corrected before it was used to judge

The ink metric summed element bounding boxes and counted every `svg` and `canvas` whole, so
a full-bleed `svg` painting nothing scored ~100%. It reported 59.3% for a sparse dot field.
Ink is now counted from the screenshot itself and split by contrast, because a single
threshold still called the rejected slice 6.67% painted with zero empty bands — its 28px
substrate paints across the full width at 1.18:1, invisible to a reader and solid to a pixel
counter. The split reproduces the independent critic's hand measurements of that slice:
strong ink 2.42% against their 2.48%, empty bands 58.3% against their 58.3%.

Two capture defects were fixed alongside it: the pipeline could not run without a Chrome
desktop install, and `capture.mjs` killed its server with the Windows-only `taskkill`, so on
POSIX a stale server kept port 3101 and the next run photographed a page that no longer
existed in the source — `HANDOFF.md`'s stale-screenshot trap, mechanised.

### Still open

- **Screenshots do not exist yet.** The ledger has none, this container's egress blocks both
  live demos, and the project repositories carry only badges and favicons.
  `scripts/capture-shots.mjs` and `docs/portfolio/CAPTURE_SHOTS.md` exist so a local agent
  with network access can capture them. YORR has no deployed URL at all
  (`CONTENT.md` §8), so it needs the mirror run locally or an honest "not captured".
- **Screenshot slots.** The frames are designed to be finished while empty, so the images no
  longer block the direction — but the corridor's last stretch is thinner than its middle,
  and the honest fix is more shots per project rather than tuning the plane spacing now.

### Locked (2026-09-01)

The direction is locked. Evidence: `review/structural/locked/`, `review/tone/`, `review/root/`.

The rejected rounds moved to `review/rejected/`. They belong in the record but not in the
judged directory: the gate calls any file older than `src/` stale, and an archive of a
concept whose code has been deleted can never be fresh again. Leaving them there would
have meant either a permanently red gate or a habit of ignoring it.

**Composition.** The landing opens *inside* the arrangement rather than becoming it on
scroll — planes at depth with the name across them, 160px at 1920 and 56px on two lines at
320. First-screen text stays exactly the name: `firstScreenChars` is 12 at every breakpoint
and the capture pipeline measures it. Then a corridor the visitor scrolls through, then a
footer of the links `CONTENT.md` §8 marks 사용.

Measured against the slice this replaces: strong ink 2.00% at 1920 versus 2.42%, and empty
bands **0% versus 58.3%**. The ink totals are nearly identical, which is the finding — the
rejected page was never short of ink, it put all of it in a left-hand column and left the
right 58% dead.

**Two defects fixed by geometry rather than by eye.** The camera could fly inside a plane
and fill the frame with flat interior, so every plane's near edge is now held outside a
channel around the axis and the camera travels straight down it: intersection is
impossible, and `layout.test.ts` asserts it analytically. Cutting a fixed tail off the
camera's travel to stop it running past the planes then made scroll progress 100% land on
the second project, leaving the third unreachable by scrolling; the stop point is now the
last project's own target.

**Tone: the dark ground, `/t1` of three treatments.** Chosen on what the frames will
actually hold. A screenshot is a bright rectangle: on the dark ground it separates
completely, on the clay it separates well, and on the kept-paper treatment it does not
separate at all — that treatment looks best today and is the only one that collapses the
moment real images arrive.

This inverts `DESIGN_SYSTEM.md` §3's canonical-light rule, and the inversion is total
rather than a toggle: there is no second theme state. Nothing in the code queried
`prefers-color-scheme`, no light design existed against the new canon, and a
half-maintained light theme is worse than none in a repo that has already shipped one
invisible-contrast failure. §3's table is replaced with the measured values; every one
clears its floor, including the 1.6:1 rule floor the old `--rule` never met at 1.18:1.

**The site is the landing.** `/` renders it; nineteen candidate routes and the entire seam
page are deleted. The rendered evidence stays under `review/` as the record of what was
rejected and why.

## 구성 교체 — 절 넷을 세로로 쌓는다 (2026-09-03, 소유자 지시)

**지시.** 소유자가 참조 사이트 `https://www.aarab.me/` 를 제시하고 "이 사이트같은
모양으로 변경하고 싶어. 메인 · 스킬 · 프로젝트 · 이력 이 순서로" 라고 지시했다.
절의 이름과 순서는 소유자가 직접 지정한 것이므로 이 저장소가 다시 판단하지 않는다.

**교체된 것.** 3D 회랑 구성 전체 — `HeroDiorama` · `HeroScene` · `HeroPoster` ·
`CorridorCanvas` · `CorridorGallery` · `MobileFilmstrip` · `ShotPlane` · `DepthFog` ·
`texture.ts` · `StaticFallback` · `ProjectMeta` · `FirstFrameSignal` ·
`useEnhancementGate` · `useIsWide` · `landing/layout.ts` 와 그 기하 테스트,
`e2e/lazy-mount.spec.ts`. 회랑이 없으므로 그것을 지키던 게이트도 함께 지웠다.
`PlaceholderFrame` 은 남긴다 — `/projects/yorr` 의 `BannerFrame` 이 계속 쓴다.

**새 구성.** `src/content/site.ts` 의 `SECTIONS` 배열 하나가 절의 순서를 소유하고,
`src/app/page.tsx` 와 `SiteNav` 가 그 배열만 읽는다. 순서를 바꾸는 일은 배열 한 곳을
고치는 일이다.

| 절 | 무엇이 있는가 | 출처 |
|---|---|---|
| 메인 | 이름 · 포지셔닝 두 문장 · 실측 숫자 셋 | `CONTENT.md` §1 · §2.1 · §2.5 · §4.1 |
| 스킬 | 영역 6개 · 등급 A/B/C. 등급 D 는 뺐고 뺀 사실을 화면에 적는다 | `CONTENT.md` §6 |
| 프로젝트 | 본류 3개(기간 · 팀 · 역할 · 스택 · 사실 셋 · 링크) + 2군 3개 | `CONTENT.md` §2 ~ §5 |
| 이력 | 교육 · 과정 · 프로젝트 · 자격 · 활동을 최근순 한 줄로 | `CONTENT.md` §7 |

**스크린샷은 여전히 없다.** 액자를 놓지 않는 쪽을 골랐다 — `HANDOFF.md` §2 가 기록한
두 번의 실패(작은 액자 = 깨진 이미지 실루엣, 큰 액자 = 빈 슬래브)를 세 번째 형태로
반복하지 않기 위해서다. 자산이 오면 프로젝트 카드의 `키워드`와 `columns` 사이가 그
자리다. `shots.ts` 의 `PROJECTS` 는 그대로 남겨 두었으므로 `src` 한 줄씩만 채우면 된다.

**모션 언어를 고쳤다** (`MOTION_LANGUAGE.md` §5.1 · §9 · §12 · §12.1 · §13). 이전
문서는 「뷰포트 진입 시 절 페이드인」을 반려 목록에 두고 있었고, 그 논거는 "문서는
처음부터 읽히는 것이 정직하다"였다. 그 논거는 한 편의 글이던 이전 구성에 대한 것이다.
절 넷을 쌓는 구성에서 진입 전이는 절과 절을 가르는 구조 신호이므로 허용으로 옮기되,
조건 넷(요소당 1회 · `opacity`+`translateY` 20px 이하 · 스크롤 오프셋의 함수가 아닐 것 ·
축소 모션에서 첫 페인트부터 최종 상태)을 붙였다. 게이트는 느슨해지지 않았다 —
`src/motion-ownership.test.ts` 의 Motion 허용 목록은 `Reveal.tsx` **한 줄**이고, 그
한 줄이 "진입 장치는 사이트 전체에서 하나"를 기계로 지킨다.

§12 의 소유권 표도 다시 썼다. 이전 표의 `SP1` · `S2` · `SP2` · `G1` · `M1` 은 2026-09-01
라우트 승격 때 컴포넌트가 삭제되어 표에만 남아 있었다. 없는 것을 선언된 소유권으로 세지
않는다. **시그니처 인터랙션은 지금 0개이고, 그 사실을 표에 그대로 적었다.**

**검증.** lint 0 error (기존 경고 1건은 `PlaceholderFrame` 의 `<img>`) · typecheck 통과 ·
vitest 104개 통과 · `next build` 통과 · playwright 8개 통과. 렌더 증거는
`review/redesign-2026-09-03/` 에 있다 (1920 · 1440 · 320 첫 화면과 전체, 절별 근접
캡처 포함).
