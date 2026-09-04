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

### 표기 개정 (2026-09-03, 같은 날 두 번째 소유자 지시)

- **이름은 `jadewisemann` 이다.** 히어로 · 상단 막대 · `<title>` 세 곳의 한글 이름을
  라틴 표기로 바꿨다. 히어로에 함께 찍던 라틴 표기(`handle`)는 이름과 중복되므로 뺐다.
- **절 라벨은 `main` · `skills` · `project` · `이력` 이다.** 소유자가 그 조합을 직접
  지정했으므로 넷째만 한국어인 것을 통일하지 않는다. 이전의 긴 제목 문장(「무엇을 쓸 수
  있는가」 · 「무엇을 만들었는가」 · 「어디를 지나왔는가」)은 이 라벨로 대체됐다.
  설명 한 문장과 본문은 한국어로 남는다.
- **히어로 급수 계단을 다시 잡았다.** 이름이 한글 세 글자에서 라틴 열두 글자가 되어
  이전 계단(88 ~ 264px)은 모든 뷰포트에서 넘쳤다. 눈으로 맞추지 않고 실측했다 — 이
  조판에서 낱말의 폭은 급수의 6.40배로 일정하고(19개 폭에서 확인), 각 단계는 그 단계가
  시작되는 폭의 자리를 6.40 으로 나눈 값에서 3% 를 뺀 것이다. 웹폰트 스왑 전 대체
  글꼴이 더 넓을 수 있어 여유를 둔다. 실측 결과 320 ~ 1920px 전 구간에서 여유가
  11 ~ 73px 남는다.
- **절 제목을 프로젝트 이름보다 한 계단 위로 올렸다** (44 / 56 / 80px). 둘이 같은
  급수면 「project」와 「YORR」이 같은 층으로 읽혀 목록의 머리와 항목이 구분되지 않는다.

## 서체 교체와 테마 · 서체 선택 (2026-09-03, 소유자 지시)

**지시.** "폰트 못생겼어. 구글 웹폰트에서 좀 적당히 힙한거 해주고 우측 상단에 화이트 모드
다크 모드랑 폰트 고를 수 있느 설정도 좀 놔둬."

### 서체 — 조합 셋

| `data-font` | 라틴 | 한글 | 등폭 |
|---|---|---|---|
| `grotesk` (기본) | Space Grotesk | Gothic A1 | JetBrains Mono |
| `serif` | Fraunces | Noto Serif KR | JetBrains Mono |
| `plex` | IBM Plex Sans KR | IBM Plex Sans KR | IBM Plex Mono |

전부 Google Fonts (OFL-1.1) 다. 그런데 **`next/font/google` 로 싣지 않는다** — 그 경로의
서체 목록에 korean 서브셋을 지원하는 것이 0종이기 때문이다 (Next 16.3.3 의
`font-data.json`, 2026-09-03 재확인. 이 저장소가 처음부터 로컬 서브셋을 쓴 이유가 그것이고,
서체를 바꾼다고 사정이 달라지지 않았다). 원본 ttf 를 `google/fonts` 에서 받아
`npm run fonts` 로 굽는다.

`Fraunces` 는 축이 넷인 가변 서체다. `WONK`(비관습적 글자꼴)를 1 로 고정한 것이 이 서체를
고른 이유이고, `opsz` 는 큰 조판에 맞춰 144 로 고정했다. 가변으로 남기지 않고 인스턴스로
구워 파일을 12KB 로 줄였다.

**서브셋의 원고를 바꿨다.** 이전에는 `docs/portfolio` 의 문서 셋이었는데 그것은 원장이지
화면이 아니다 — 화면에 없는 글자를 굽고, 컴포넌트에 직접 박힌 문구는 빠질 수 있었다.
이제 `src` 아래의 모든 `.ts` · `.tsx` 에서 주석을 걷어낸 것이 원고다.

**히어로 급수 계단을 다시 잡았다.** 이름은 끊을 자리가 없는 한 낱말이고, 낱말의 폭은
급수에 비례하되 비율이 조합마다 다르다 (Grotesk 6.502 · Plex 6.403 · Serif 5.322).
계단은 셋 중 **가장 넓은 6.502** 를 기준으로 잡는다 — 기본값에만 맞추면 다른 조합에서
넘친다. `e2e/geometry.spec.ts` 가 세 조합 모두에서 판정한다.

### 테마 — 라이트를 되살리되 반전으로 만들지 않는다

`DESIGN_SYSTEM.md` §3 은 2026-09-01 에 「다크가 유일한 테마이고 두 번째 상태는 없다」로
잠겨 있었다. 그 폐기 사유는 **「아무도 보지 않는 반쯤 유지되는 테마는 없는 것보다
나쁘다」** 였고, 지금도 유효하다. 그래서 라이트를 값마다 새로 설계하고 대비를 전부 다시
계산했다 (§3 의 두 번째 표 — 본문 7.0 · 주석 4.5 · 괘선 1.6 하한을 전부 넘긴다).

두 가지를 그대로 지켰다:

- **다크가 계속 정본이고 기본값이다.** 「시스템」이 아니라 「다크」가 기본이다 —
  팔레트도 히어로의 빛 웅덩이도 어두운 지면을 전제로 설계됐고, 처음 보는 화면이 그
  설계여야 한다. OS 를 따르려는 사람은 「시스템」을 한 번 고르면 된다.
- **괘선 기판의 세기는 두 상태가 같다 (24%).** 계산 결과다 — 24% 로 섞은 괘선의 대비가
  다크 1.128, 라이트 1.122 로 사실상 같다.

### 선택값은 리액트가 아니라 DOM 이 갖는다

`<html>` 의 `data-theme` · `data-theme-choice` · `data-font` 가 상태의 소재지이고,
첫 페인트 전에 도는 인라인 스크립트가 `localStorage` 에서 읽어 세운다. 리액트는
`useSyncExternalStore` 로 구독만 한다.

사유는 축소 모션에서 이미 한 번 겪은 결함과 같다 (`MOTION_LANGUAGE.md` §13.1) — 리액트를
값의 주인으로 두면 저장된 값이 라이트인 사람이 첫 프레임에 다크를 보고 하이드레이션
뒤에 흰 화면으로 뒤집힌다. `e2e/settings.spec.ts` 가 새로고침 뒤 `domcontentloaded`
시점의 `data-theme` 를 보고 그 회귀를 막는다.

### 검증

lint 0 error · typecheck · vitest 104 · `next build` · playwright **22** (넘침 판정이
서체 조합 셋으로 늘고, 설정 스펙 넷이 새로 생겼다). 렌더 증거는
`review/redesign-2026-09-03/combos/` 에 테마 2 × 서체 3 의 첫 화면과 패널을 연 상태로
있다.

## 표면 전면 교체 — aarab.me (2026-09-03, 3차)

**지시.** 소유자가 `https://www.aarab.me/` 를 헤드리스로 방문해 디자인을 가져와
적용하라고 했다. 강도를 물었을 때 답은 **「전면 교체」**였다.

**추출.** 헤드리스 브라우저로 계산된 스타일과 DOM 구조를 뽑았다. 결과는
`REF_AARAB.md` 에 있다 — 색 토큰 20종, 조판 7행, 레이아웃 값, 절 구성 6개, 배경 처리,
모션. 마크업과 에셋은 가져오지 않았다. **디자인 언어를 옮긴 것이고 복제한 것이 아니다.**

**적용한 것.**

- 팔레트 전체 (`DESIGN_SYSTEM.md` §3). 지면 `#050507`, 강조색 시안 `#5fd2f2` 하나.
- 디스플레이 서체 Instrument Serif 신설. 조합 셋과 무관하게 항상 실리고, 이름 ·
  절 제목 · 절 번호 · 프로젝트 페이지의 여는 제목을 맡는다.
- 조판의 축을 **큰 세리프의 음수 자간 ↔ 작은 등폭 대문자의 큰 양수 자간**으로 바꿨다.
  라벨 성격의 글자 전부가 후자를 쓴다.
- 절 제목 뒤의 초대형 유령 숫자 (`--ink` 16%, 디스플레이 이탤릭).
- 28px 괘선 기판 → 입자 낀 시안 웅덩이 배경장 (`ART_DIRECTION.md` §3.11).
- 스킬 영역과 프로젝트를 **모서리 둥근 카드**로. 프로젝트 이름은 계단에서 내려와
  등폭 대문자가 되고, 무게는 카드가 낸다.

**가져오지 않은 것 셋, 그리고 그 이유.**

1. `backdrop-filter: blur` — `src/motion-ownership.test.ts` 가 막는다. 불투명 면 +
   괘선으로 대신했다.
2. SKILLS 절의 무한 마퀴 — `@keyframes` 금지(`MOTION_LANGUAGE.md` 2절)에 걸리고,
   마퀴로 바꾸면 이 사이트의 숙련도 등급 정보가 사라진다. 정보 손실은 표면 교체의
   범위가 아니다.
3. 참조 사이트의 괘선 값 `#181825` — 이 지면에서 대비 1.16 으로 `DESIGN_SYSTEM.md`
   §3 의 괘선 하한 1.6 을 못 넘는다. 값만 하한 위로 올렸다 (`#3a3a52`, 1.85).

넷째로, 본문 링크의 밑줄은 유지했다. 참조 사이트는 밑줄이 없지만 이 저장소는 색
하나에 의미를 걸었다가 실제 결함을 낸 적이 있다. 호버 색만 강조색으로 바꿨다.

**라이트 테마는 유지했다.** 참조 사이트에는 없으므로 **파생한 것**이다 — 역할은 다크와
같게 두고 값은 새로 잡아 대비를 다시 쟀다. 화면에서 테마와 서체를 고르는 장치는
같은 날 소유자가 지시한 것이므로 표면 교체가 그것을 되돌리지 않는다.

## 워크플로 하네스 폐기 (2026-09-03)

소유자 지시: 「.claude 안에 있는 그래프 엔지니어링이나 루프 엔지니어링 부분이랑
관련 스킬도 전부 폐기해.」

지운 것: `.claude/agents/` (9) · `.claude/skills/` (10) · `.claude/runtime.json` ·
`scripts/graph.mjs` · `scripts/graph.test.mjs` · `package.json` 의 `graph` 스크립트.
`CLAUDE.md` 에서 코디네이터 · `/portfolio-build` · state.json 전이 규칙을 걷어냈다.

**규율은 문서가 아니라 테스트가 지킨다.** 그래프 게이트가 하던 일 중 실제로 무언가를
막고 있던 것은 vitest 게이트 넷이고, 그것은 그대로 남는다 —
`motion-tokens` · `motion-ownership` · `forbidden-claims` · `e2e/geometry`.
`scripts/capture.mjs` 도 남는다. 그래프의 산출물이 아니라 렌더 증거 도구다.

미완: `.claude/hooks/` · `.claude/settings.json` · `docs/portfolio` 의 상태 파일
(`graph.json` · `state.json` · `scorecard.json` · `journal.ndjson` ·
`SCENE_GRAPH.md` · `SCORECARD.md` · `FINAL_AUDIT.md` · `HANDOFF.md`) 은 지우지
못했다 — 훅과 설정 삭제가 자동 승인 정책에 걸린다. 소유자가 직접 지워야 한다.

## 첫 화면 — 배경장 · 유리 내비 · 가운데 세리프 (2026-09-03, 4차)

소유자가 aarab.me 첫 화면 스크린샷을 지목했다: 입자 낀 덩어리 두세 개가 천천히
움직이고 겹치면 합쳐지는 배경, 애플 리퀴드 글라스 같은 내비, 올드머니 세리프.

**게이트를 열되 문서와 함께 열었다.** 이전 라운드에서 "가져오지 않은 것"으로 적었던
키프레임과 backdrop-filter 를 소유자가 명시적으로 요구했으므로, 규칙을 우회하지 않고
`MOTION_LANGUAGE.md` §2 · §7 에 예외 조항을 쓰고 `src/motion-ownership.test.ts` 의
허용 목록을 **파일 하나씩**으로 좁혔다 — 배경장은 `Field.module.css`, backdrop 은
`SiteNav.module.css`. `filter: blur` 는 여전히 0개다.

- `Field` — 덩어리 셋, 주기 70 · 90 · 110초(서로 소), `translate` 만 움직인다. SVG 필터
  `feGaussianBlur → feColorMatrix(알파 대비) → feTurbulence → feComposite(arithmetic)`
  가 합쳐짐과 모래 가장자리를 만든다. 필터 층은 뷰포트 절반으로 그려 두 배 확대 —
  비용 4분의 1. 축소 모션에서 정지.
- `SiteNav` — `position: fixed` 알약, `backdrop-filter: blur(18px) saturate(1.6)`,
  1px 테두리 + inset 하이라이트/그늘. 앵커 착지 108px.
- 히어로 가운데 정렬, `100svh`. Instrument Serif Italic 을 추가로 실어 절 번호가 합성
  기울임이 아니게 했다.
- 히어로 실측 숫자를 강조색에서 잉크로 되돌렸다 — 움직이는 시안 배경 위에서 시안
  글자가 사라졌다 (실측). 강조색 텍스트 자리는 셋으로 줄었다.

**필터 값은 실측으로 잡았다.** 첫 값(알파 ×3.2, 입자 알파 무작위)은 덩어리를 어둡고
경계가 딱딱한 회색 원으로 만들었다. 입자를 불투명 회색으로 고정하고(알파 무작위가
곱셈에서 전체를 어둡게 했다) 알파 대비를 ×1.3 으로 낮추자 참조와 같은 밝은 시안
덩어리가 됐다.

## 메인 2차 — 이름만, 유리, 흐름, 그리고 성능 (2026-09-03, 4차)

소유자 지시 넷: (1) 첫 화면의 글자를 전부 빼고 다음 장으로, (2) 배경이 안 움직인다 —
움직이고 원끼리 상호작용하게, (3) 2장부터 유리 면이 뒤에서 조심스럽게 올라오게,
(4) 스킬은 참조처럼 흐르는 알약 줄로. 그리고 "느려진다 — 성능 신경 써라".

**성능이 결정의 축이다.** 1차 배경장은 SVG 필터(블러 + 입자 합성)를 움직이는 층에
걸었고 매 프레임 뷰포트 전체를 래스터했다. 걷어냈다:

| 성질 | 1차 (느림) | 2차 |
|---|---|---|
| 흐림 | `feGaussianBlur` 매 프레임 | 그러데이션 정지점 (정적) |
| 합침 | `feColorMatrix` 알파 대비 | `mix-blend-mode: screen` (픽셀당 곱셈) |
| 입자 | `feTurbulence` + `feComposite` 매 프레임 | 정적 200px 타일 1회 래스터, `overlay` |
| 이동 | 70 · 90 · 110초 (지각 불가) | 22 · 28 · 34초, 궤도가 서로 가로지름 |

같은 이유로 **유리는 정지한 면에만** — 내비 · 소개 카드 · 프로젝트 카드 셋. 흐르는
알약 수십 개에 backdrop 을 걸면 그 면적만큼 매 프레임 다시 흐려야 한다. 알약은
불투명 `--ground-2` 다. 블러 반경도 22 → 16px.

**게이트 개정.** `motion-ownership.test.ts` 허용 목록: 키프레임 → `Field.module.css` +
`SkillsSection.module.css`, backdrop → `globals.css`(`glass` 유틸리티) 한 자리. 문서는
`MOTION_LANGUAGE.md` §2 · §7, `DESIGN_SYSTEM.md` §2 · §3, `ART_DIRECTION.md` §0.

**정보는 잃지 않았다.** 첫 화면에서 뺀 역할 · 두 문장 · 숫자 셋은 같은 절의 2장에
그대로 있다. 마퀴 알약 안에 등급 칸이 있다. 축소 모션에서는 흐름이 멈추고 둘째 벌이
사라지고 줄바꿈 목록이 된다 — 흐르지 않는 잘린 목록은 결함이다.

## 메인 3차 — goo · 한글 · 숨는 내비 · 페이지 표시 · 어두운 막 (2026-09-04)

소유자 지시 다섯.

1. **끈적하게 붙는 배경장.** 소유자가 방식을 지정했다 — "블러 치고 콘트라스트 높이고
   다시 블러". `Field.tsx` 의 goo 필터. 성능 조건은 유지한다: 무대를 뷰포트의 ¼ 로 그려
   4배 확대(래스터 1/16), 입자는 체인 밖 정적 타일.
2. **한글이 이상하다.** 원인 둘. (a) 디스플레이 스택의 둘째 자리가 조합의 고딕이라
   「이력」이 세리프 옆에서 고딕으로 섰다 → Noto Serif KR. (b) 라벨 자간 0.14~0.2em 이
   한글을 흩었다 → 한글 섞인 라벨은 0.08em. `DESIGN_SYSTEM.md` §4.
3. **내비가 스크롤에 맞춰 숨는다.** 이산 상태 둘, 문턱 12px, 첫 화면에서는 안 숨는다.
   `MOTION_LANGUAGE.md` §5.1.
4. **페이지 표시.** 오른쪽 가장자리에 점 넷 + `01 / 04`. 상단 알약과 같은 `current`.
   768px 미만은 숨긴다 — 여백이 없어 글자를 덮는다.
5. **2장부터 어두운 막.** `.section` · 메인 2장 배경 지면색 45%. 카드 유리는 52 → 68%.
   막에는 블러를 걸지 않는다 — 면적이 뷰포트 몇 장이다.

## 메인 4차 — 설명을 걷어내고 보이게 (2026-09-04)

소유자 지시: "2장 제거 — 너무 어색. 스크롤은 임계를 넘으면 한 번에. 스킬의 설명 · 카테고리
제거, 아이콘 추가. 고지는 하단으로. 설명이 아니라 시각적으로 보면 이해되는 게 좋다."

- **2장(유리 소개 카드) 삭제.** 하루 전 결정을 되돌린다. 역할 · 두 문장 · 숫자 셋은
  `profile` 에 남고 화면에 없다. 첫 절은 이름 하나다.
- **절 단위 스냅.** `html { scroll-snap-type: y mandatory }` + 절마다 `scroll-snap-align:
  start; scroll-snap-stop: always`. 긴 절 안은 자유 스크롤(스펙). 이송 시간은 브라우저 것 —
  `scroll-behavior` 금지와 같은 논리로 사이트가 값을 갖지 않는다. 절의 `scroll-margin-top`
  을 0 으로 — 앵커용 108px 이 스냅에 붙으면 빈 띠가 생긴다.
- **절 설명 문장 삭제** (`Section` 의 `.note`). 값은 `aria-description` 으로만.
- **스킬**: 범례 · 영역 이름 · 고지 삭제. 알약에 브랜드 아이콘(`simple-icons`, CC0,
  새 의존성 1). 브랜드색을 그대로 쓴다 — 강조색 단일 규칙의 예외이고 근거는
  `skill-icons.ts`. 브랜드 없는 기술(Zustand · IndexedDB · 반응형 · SQL/RDB)은 대체 점.
- **고지는 푸터 맨 아래 각주로.** 스킬 · 프로젝트 절의 ⚠️ 문장 다섯을 그대로 옮겼다.
  조용히 자르지 않는다는 규율은 유지되고 읽는 자리만 바뀐다.

## 프로젝트 무대 · 이력 사실 · 푸터 (2026-09-04)

**프로젝트 절은 무대다** (`ProjectStage.tsx`). 표지 한 장(「03 project」 가운데) → 아래로
내려가면 제목이 위에 붙고 프로젝트 하나가 한 줄 → 프로젝트 사이는 **세로**, 한 프로젝트
안은 **가로**(글 한 장 · 데스크톱 화면 한 장씩 · 모바일 화면 묶음 한 장). 소유자가
방향을 한 번 바로잡았다 ("커버 아래로, 좌우로").

스크럽이 아니다. 절 높이 = 장 수 × 100svh, 투명 슬롯이 스냅 눈금, sticky 무대, IO 가
슬롯 번호 하나를 주고 CSS 가 (줄, 칸)으로 `translate` 한다. 프레임마다 하는 일이 없다.
`MOTION_LANGUAGE.md` §5.1 에 적었다. 화면 밖 장은 `inert`.

랜딩의 프로젝트 글자는 이름 · 한 줄(기간 · 팀 · 역할) · 블러브 · 키워드 · 링크로 줄였다.
스택 · 사실 세 줄은 프로젝트 페이지의 것이다. `Shot` 에 `video` 필드를 열었다 — 자동
재생 없음.

**이력 사실 다섯 — 소유자 구술** (원장 `../_jadewisemann/ref/` 에 없음. 옮겨 적어야 한다):
videOn 항목 삭제 · OPIc IH 삭제 · SW 역량테스트 A+ 를 2026.05 로 · 2026.06 SSAFY 수상 셋
(1학기 성적우수상 1위 · 1학기 프로젝트 우수상 2위 · 공통 PJT 발표회 1위, 셋째에만
「발표자」). `TimelineKind` 에 「수상」추가. **이 다섯은 CLAUDE.md 의 「ref 에 없는 사실은
싣지 않는다」규칙의 예외이고, 예외의 근거는 소유자 본인의 지시다.**

**푸터**는 GitHub · Velog · 이메일 셋 + 각주(고지). 프로젝트별 링크는 각 장에 있다.

## 절 라벨 「이력」→ `history` (2026-09-04)

소유자 지시. 넷째 절만 한글이어서 절 제목 중 하나만 Noto Serif KR 로 그려졌다 — 이제
넷 다 Instrument Serif 다. `SECTIONS[3]` 의 `nav` · `title` 두 줄.

## 무대 안에서 휠 한 번 = 장 한 장 (2026-09-04)

소유자: "프로젝트 안에서 스크롤을 안 먹는데? 수평으로 움직이긴 하는데 스크롤하면 자동으로
넘어간다." 슬롯 스냅만으로는 트랙패드 관성 한 번이 슬롯 여럿을 지나갔다.

무대 안에서 휠을 가로챈다(`ProjectStage.tsx`): 델타를 모아 40 을 넘으면 정확히 한 장,
전이가 끝나기 전(750ms)의 휠은 버린다. 첫 장에서 위로 · 마지막 장에서 아래로는 가로채지
않아 절 밖으로는 브라우저 스냅이 넘긴다. 터치 · 키보드는 그대로다. `MOTION_LANGUAGE.md`
§5.1 — 이산 걸음이고 스크럽이 아니다.

## 내비 폭 · 모션 한 단 느리게 · Pretendard (2026-09-04)

- **내비 알약**은 내용 폭만큼, 가운데. 좌우로 꽉 채우던 것을 소유자가 "전체 페이지를
  먹어버린다"고 했다.
- **모션 토큰** (`MOTION_LANGUAGE.md` §3 · §4, `globals.css`, `Reveal.tsx` 함께): state 120 →
  180 · sort 320 → 520 · spine 620 → 1100 · hold 200 → 300ms. `--ease-spine` 을 expo-out
  `(0.16, 1, 0.3, 1)` 에서 in-out `(0.7, 0, 0.15, 1)` 로 — 「끈적함」은 출발의 저항이다.
  진입 이동 56 → 72px. 무대 휠 쿨다운 750 → 1250ms.
- **Pretendard** (OFL, 원 저장소에서 받음): 기본 조합의 한글(Gothic A1 대체)이자 세 조합
  공통의 **등폭 자리**. 등폭 서체는 스택에서 사라졌다. Gothic A1 파일 · 고지 삭제.

## 무대 — 이름이 제목 옆으로, 문장 줄임, 칩 (2026-09-04)

- 글 장 → 화면 장으로 옆으로 넘어가면 **프로젝트 이름이 「03 project」 옆에 붙는다**
  (`.headName`, translate + opacity, spine 토큰). 글 장이 왼쪽으로 빠지는 방향과 반대로
  들어와 옮겨 붙는 것으로 읽힌다.
- 글 장의 「기간 · 팀 · 역할」 한 줄을 뺐다 — 기간만 번호 줄에 붙인다. 남는 글자는 이름 ·
  블러브 · 키워드 · 링크. 블러브 문장은 `shots.ts` 정본 그대로다.
- **키워드 칩** — 괘선 하나 → 강조색 14% 면 + 강조색 45% 괘선 + 잉크 글자, 600, 알약형.

## 각주 삭제 · 무대 끝에서 history 로 · 이동 중 블러 (2026-09-04)

- **푸터 각주 삭제.** 고지 다섯 문장은 화면 어디에도 없다. 문장 자체는 `site.ts` 에 남아
  `forbidden-claims` 게이트의 근거로 산다.
- **무대 끝 → history.** 마지막 장에서 아래 휠을 브라우저 스냅에 맡겼는데, 휠 한 번의
  거리가 스냅 간격의 절반에 못 미쳐 제자리로 되돌아왔다 (실측 y 불변). 이제 무대 안 휠
  걸음이 절의 끝(= history 시작)까지 한 걸음으로 옮긴다. 표지에서 위로는 그대로 native.
- **줄 바뀔 때 흩어짐.** 처음엔 블러(18px)였고 소유자가 같은 날 두 번 고쳤다 — "한 프로젝트
  안의 가로 이동엔 필요 없다", "블러보다는 구성요소가 흩어지게". 지금은 줄(프로젝트)이
  바뀌는 1100ms 동안 글 조각과 액자가 nth-child 로 정해진 방향으로 `translate` + `opacity 0`,
  도착하면 되돌아온다. `filter: blur` 는 다시 0개, 게이트도 원래대로.

## 헤딩은 디스플레이 세리프 (2026-09-04)

소유자: "프로젝트명 같은 헤딩들은 전부 그로테스크, nav 영어도" → 몇 분 뒤 "그거 말고
1페이지 jadewisemann 에 쓰는 예쁜 폰트로". 프로젝트 이름 · 제목 옆 이름 · 「그 외」이름 ·
이력 항목 제목 · 내비 링크 · 브랜드가 Instrument Serif. `--font-grotesk` 는 만들었다가
지웠다. `DESIGN_SYSTEM.md` §4. 같은 날 모션도 "살짝만 빠르게": spine 900 · sort 440 · hold 260.

## 제목 옆 이름의 깜빡임 · 내비의 귀환 (2026-09-04)

- 줄이 바뀌는 순간 제목 옆 이름이 새 프로젝트 이름으로 바뀌며 한 번 나타났다 사라졌다.
  보이는 동안(칸 > 0)에만 이름을 갱신하고, 꺼지는 동안은 마지막 값을 유지한다.
- 내비 알약은 아래로 내려가면 숨고, **입력이 1.8초 멎으면 슬그머니 돌아온다**.

## 제스처 경계 · 부드러운 퇴장 · 발표회 8월 (2026-09-04)

- **전이 중에 시작된 휠 제스처는 통째로 버린다.** 이벤트 사이 120ms 공백이 제스처 경계다.
  전이 뒤 남은 관성이 다음 장을 또 넘기던 것을 막는다.
- **무대를 떠나는 걸음만 브라우저의 부드러운 이송**(`behavior: "smooth"`). 무대 안의
  걸음은 sticky 라 문서 점프가 보이지 않지만, 떠날 때는 문서가 실제로 움직여 뚝 끊겼다.
  이송 시간은 브라우저 것 — §5.3 과 같은 이유.
- 공통 PJT 발표회는 **2026.08**, YORR 바로 다음. YORR 의 정렬 키를 끝난 달(08)로 두고
  안정 정렬의 배열 순서를 이용한다.

## 역방향 이동의 장 경계 (2026-09-04)

위 줄로 되돌아갈 때 그 줄의 레일이 0번 칸에서 마지막 칸으로 옆으로 미끄러지며 세로 이동과
겹쳐 장의 경계가 보였다. 안 보이는 줄의 칸을 **들어올 때 도착하는 칸**에 대 놓는다 — 위
줄은 마지막 칸, 아래 줄은 첫 칸. 장의 세로 스크롤 막대도 숨겼다(경계선으로 보인다).

## 설정 메뉴 삭제 (2026-09-04)

소유자: "nav 에 설정은 없어도 되겠다 이제." `SettingsMenu` 컴포넌트 · CSS · e2e
`settings.spec.ts` 삭제. 테마 · 서체의 부트 스크립트와 CSS 분기는 남는다 — 값이 저장돼
있으면 읽지만 화면에서 바꾸는 장치는 없다. 기본 grotesk + 다크.

## 데모 스크린샷을 직접 찍어 채움 (2026-09-04)

소유자: "브라우저로 스크린샷을 직접 찍어서 채워 넣어 줘. 없으면 깃허브 저장소에서 가져와도
좋고." `scripts/capture-shots.mjs` 로 찍었다 (이 세션은 네트워크가 열려 있다).

- **두 데모 모두 백엔드가 죽어 있다.** networkidle 뒤 20초를 기다려도 목록 · 상세 · 검색
  결과는 스켈레톤이다. 스켈레톤 장은 넣지 않았다 — 빈 화면을 스크린샷이라고 넘기지 않는다
  (`CAPTURE_SHOTS.md`). 남은 것: FestiFriends 랜딩(데스크톱 · 모바일) · 캘린더,
  Pookjayo 랜딩(모바일 · 데스크톱). 다섯 장.
- **YORR 은 화면이 없다.** 배포 URL 없음, 미러 저장소에 이미지 0장(마스코트 SVG 만).
  `shots: []` — 글 장 하나만. 배포되거나 로컬로 띄우면 채운다.
- 설정 경로를 실측대로 고쳤다: FestiFriends `/groups` 404 → `/calendar`, Pookjayo
  `/search` 404 → `/search-result?keyword=…`. 캡처 settle 기본 6초(스플래시 · 후속 페치).

## YORR 화면 — yorr.site (2026-09-04)

소유자: "yorr 배포는 yorr.site 야. yorr 가 엄청 중요해. 주사위는 gif 같은 걸로 해도 좋아."

- 랜딩(데스크톱 · 모바일)은 3D 주사위 히어로 — 그대로 찍었다.
- 게임판은 방이 필요하지만 **`/tutorial`(혼자 굴려보기)** 이 있어 Playwright 로 직접
  굴리며 찍었다. 파티 모드 데스크톱은 QR 대기실뿐이라 넣지 않았다.
- **주사위 굴림은 webm 루프** (4.2초, 주사위 판만 crop, 570KB). gif 인코더가 없고(Playwright
  의 ffmpeg 는 VP8 만), 있어도 같은 길이의 gif 는 수 MB 다. `<video autoplay loop muted>`
  는 브라우저에서 gif 와 같게 보인다. `MOTION_LANGUAGE.md` §2 에 「프로젝트 매체」예외를
  적었다 — 콘텍츠이고, 축소 모션에서는 포스터만.
- YORR 을 첫 프로젝트로 두는 순서는 그대로다.
