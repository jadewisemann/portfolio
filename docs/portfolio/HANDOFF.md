# HANDOFF — 다음 세션용 인수인계

작성 2026-09-01. 이 문서는 런이 중단된 지점과, 다음 세션이 **밟으면 안 되는 함정**을 기록한다.
상태의 진실은 항상 `state.json` · `scorecard.json` · `journal.ndjson` 이고, 이 문서는 그것을 읽는 방법이다.

---

## 1. 지금 어디인가

| 항목 | 값 |
|---|---|
| 노드 | `GOLDEN_FIX` |
| iteration | 1 |
| status | `BLOCKED` (소유자 지시로 일시 중단) |
| 마지막 전이 | `GOLDEN_REVIEW --fail--> GOLDEN_FIX` (2026-08-31 14:55) |

전체 20노드 중 10개 통과. `BOOTSTRAP` → `GOLDEN_SLICE` 까지 완료하고
`GOLDEN_REVIEW` 에서 떨어져 `GOLDEN_FIX` 루프에 들어왔다.

남은 경로:
`GOLDEN_FIX` → `GOLDEN_REVIEW` 재심사 → `EXPAND_SCENES` → `WHOLE_EXPERIENCE_AUDIT`
→ `MOBILE_AUDIT` → `PERFORMANCE_AUDIT` → `ACCESSIBILITY_AUDIT` → `REGRESSION` → `COMPLETE`

반복이 소진되면 `GOLDEN_FIX --exhausted--> STRUCTURAL_BRANCH --> GOLDEN_SLICE` 로 빠진다.
현재 점수대(2.8)에서는 그 경로가 현실적이다.

### 재개

```bash
node scripts/graph.mjs unblock && node scripts/graph.mjs status
```

---

## 2. 함정 세 개 — 이걸 먼저 읽어라

### 함정 1 · `state.json` 의 `failedCategories` 는 스테일이다

**작업 목록으로 쓰지 마라.** 7개가 기록돼 있지만 실제 실패는 **10개**다.

원인: `advance` 가 14:55:43 에 발사됐고, `scorecard.json` 은 15:10:00 에 비평가 실측값으로
재작성됐다. 임계값 상향도 그 뒤였다. 스냅샷은 이미 굳은 뒤였다. 그래서 두 가지가 잘못 박혔다.

1. 디렉터가 **스스로 관대하다고 판정해 폐기한 자체 추정값**이 남았다 —
   visualImpact 4.5(실측 2.8) · artDirection 5.5(3.4) · typography 6.0(4.8) ·
   originality 6.5(3.8) · narrativeClarity 7.5(7.2) · mobile 4.0(4.4)
2. **상향 전 7개 임계값 세트**로 판정됐다. `composition` · `interactionQuality` ·
   `accessibility` 가 게이트에 아예 없었다.

**올바른 작업 목록은 `scorecard.json` 실측값 × `graph.json` 의 `GOLDEN_REVIEW.gate.thresholds`
로 직접 재계산해서 얻는다.**

```bash
node -e "
const t=require('./docs/portfolio/graph.json').nodes.GOLDEN_REVIEW.gate.thresholds;
const s=require('./docs/portfolio/scorecard.json').scores;
Object.keys(t).map(k=>({k,v:s[k]?.value,th:t[k]}))
  .sort((a,b)=>a.v-b.v)
  .forEach(r=>console.log(r.k.padEnd(19),String(r.v).padStart(5),'/',r.th,r.v<r.th?'FAIL':'pass'));
"
```

> 하네스 결함으로 남아 있다: 게이트 스냅샷이 나중에 교체될 스코어카드를 상대로 계산될 수 있다.
> `GOLDEN_FIX` 의 작업 목록이 `state.json` 이 아니라 `scorecard.json` 에서 파생되게 하거나,
> 스코어카드 재작성 시 스냅샷을 무효화하는 검사를 `doctor` 에 넣어라. 아직 안 고쳤다.

### 함정 2 · 백그라운드 위임은 조용히 죽는다

이 런에서 **서브에이전트가 3회 조용히 사망**했다. 디렉터가 frontend-builder 를 백그라운드로
띄우고 결과를 기다리며 턴을 끝내면, 자식이 죽어도 아무 신호가 없다. 폴링 → 정지 → 재개 →
폴링이 반복됐고 **62분(14:55~15:58) 동안 그래프 전이가 0건**이었다.

**결과가 다음 행동의 전제라면 `run_in_background: false` 로 띄워라.** 병렬이 필요하면
한 메시지에서 여러 개를 동시에, 전부 블로킹으로.

### 함정 3 · 스테일 스크린샷으로 판정하지 마라

이 런에서 `review/golden-slice/` 에 남아 있던 이전 런 캡처가 **소스에 더는 없는 구조**를
보여주고 있었다. 그걸 증거로 받았다면 존재하지 않는 페이지를 심사했을 것이다.

**모든 판정 직전에 재캡처한다.**

```bash
node scripts/capture.mjs review/golden-slice
node scripts/capture-states.mjs review/golden-slice
```

---

## 3. 심사 결과 — 11개 중 1개 통과

`scorecard.json` 의 값. 전부 독립 비평가 실측이며 디렉터 추정치는 폐기됐다.

| 항목 | 실측 | 임계 | 판정 |
|---|---:|---:|---|
| visualImpact | 2.8 | 9.0 | FAIL |
| composition | 2.9 | 9.0 | FAIL |
| artDirection | 3.4 | 9.0 | FAIL |
| originality | 3.8 | 8.5 | FAIL |
| mobile | 4.4 | 8.5 | FAIL |
| typography | 4.8 | 9.0 | FAIL |
| interactionQuality | 5.2 | 8.5 | FAIL |
| motionCoherence | 5.8 | 9.0 | FAIL |
| accessibility | 6.8 | 8.0 | FAIL |
| narrativeClarity | 7.2 | 8.5 | FAIL |
| **performance** | **8.4** | 8.0 | **pass** |

### 실패의 뿌리는 하나다

`composition` 2.9 와 `visualImpact` 2.8 은 같은 원인을 공유하므로 **한 수정으로 같이 움직인다.**

- 1920 첫 뷰포트의 **58.3%(x1120~1920)에 잉크가 0%**
- 뷰포트 전체 잉크 2.48%(1920) / 3.64%(1440). 평범한 산문 지면이 5~8%
- 968px 밴드 + 544px 측정폭이 뷰포트 안에 중앙 정렬된 **내부 프레임** — 방향이 요구한
  외부 프레임의 기하가 없다
- 좌측 경계가 셋(레일 x=125 · 히어로 x=229 · 절 내용 x=333), 229~333 의 104px 채널이 전 높이에서 빈다
- 히어로 h1 이 1440·1920 **모두 36px**
- 96px 비율 숫자가 y=895 로 900px 뷰포트에서 잘려 첫 뷰포트에 앵커가 0개

소유자가 지정한 수정 순서를 따라라:
**개념 → 컴포지션 → 타이포그래피 → 위계 → 전환 → 모션 → 인터랙션 → 간격 → 장식.**
2.8 인 상태에서 스태거 값을 다듬는 것은 금지다.

---

## 4. Best-of-N — **두 벌**이 있고 **둘 다 판정 안 됨**

빌더가 죽기 전에 히어로 Best-of-N 을 실제로 렌더했다. 그런데 **독립적인 두 시도**가 존재한다.

**둘 다 `main` 에 병합돼 있다. 브랜치를 넘나들 필요 없이 한 트리에서 6안이 동시에 렌더된다.**

| | 컴포넌트 | 라우트 | 캡처 |
|---|---|---|---|
| A · spine | `src/components/spine/` (SpineV1/V2/V3 등 8개) | `/v1` `/v2` `/v3` | `review/hero-bestof/` 48장 |
| B · bestof | `src/components/bestof/` (V1Spine · V2Ratio · V3Field · SeamStrip) | `/b1` `/b2` `/b3` | 같은 디렉터리, 파일명 체계가 다르다 (`geometry-v1-1440.json` vs A 의 `geometry-v1-1440x900.json`) |

B 는 원래 커밋되지 않은 워크트리에 있어 소실 직전이었다. 병합 시 처리한 것:

- 공유 파일(`golden.ts` · `motion-ownership.test.ts` · `globals.css` · `/v1~/v3`)은
  **main 쪽을 채택**했다. B 의 `golden.ts` 는 main 의 부분집합이었고 `seam.ts` 는 동일했다
- B 의 CSS 179줄(`bo-` 접두사 14개 클래스)을 `globals.css` 끝에 격리 블록으로 이어붙였다.
  접두사 덕에 본편과 충돌이 없다
- B 의 라우트를 `/v1~/v3` 에서 `/b1~/b3` 으로 옮겨 A 와 동시에 렌더되게 했다
- `motion-ownership.test.ts` 허용 목록에 `src/components/bestof` 를 추가했다

**판정이 끝나면 패자를 지울 때 세 곳을 함께 지워라**: 컴포넌트 디렉터리 ·
`globals.css` 의 격리 블록 · 허용 목록 항목.

브랜치 `worktree-agent-ae5a2232a24dc642f` 는 병합 이력으로만 남는다. 삭제해도 된다.

### A 의 증거에는 결함이 세 개 있다 — 이 상태로 모바일·모션을 판정할 수 없다

md5 로 확인했다.

1. **모바일 3안이 바이트 동일** — `first-viewport-v{1,2,3}-320x640.png` 전부 `db266d39…`,
   `full-v{1,2,3}-320x640.png` 전부 `d99bb28f…`. 즉 "구조적으로 다른" 세 방향이
   **모바일에서 전혀 다르지 않다.** 모바일 아트 디렉션은 이 증거로 검증되지 않는다.
2. **reduced-motion 이 일반과 바이트 동일** (v1 `e9b6efbf…` · v2 `662001fa…`) —
   원본 슬라이스의 결함이 후보에도 그대로 옮겨왔다.
3. **`spine-mid` 가 `spine-after` 와 바이트 동일** (v2 `735cb4d2…` · v3 `a5a1070e…`) —
   전환 중간 프레임이 아무것도 못 잡았다. 3안 중 2안의 시그니처 전환이 증거로 존재하지 않는다.

→ 판정하려면 **모바일에서 실제로 갈라지는 3안**과 **중간 프레임을 잡는 캡처**가 먼저 필요하다.
지금 판정하면 데스크톱 컴포지션만 비교하는 셈이고, 그건 Best-of-N 의 목적을 절반 버리는 것이다.

---

## 5. 이 런에서 확정된 결정 (문서에 반영 완료)

코드 주석이 아니라 잠긴 문서에 들어갔다. 되돌리지 말고 이어받아라. 근거는 `DECISIONS.md`.

**`MOTION_LANGUAGE.md`**
- §3/§4 — 320ms 단일 상한 폐기. **시간적 위계**로 교체:
  즉각 ≤120ms / 장면 내 200–420ms / 장면 간 420–900ms / 홀드 ≥200ms.
  스태거 항목당 ≤60ms · 총 ≤240ms. `--ease-spine` 신설
- §5.1 — 연속 스크롤 스크러빙은 **계속 금지**. IntersectionObserver 촉발
  **참값 사이의 이산 전환은 허용**. 근거: 격하는 임의의 중간값이 화면에 남는 데서 오고,
  모든 정지 위치가 실측 비율이면 그 위험이 없다
- §12 — SP1(척추) 추가. **E1 삭제**(끝까지 미구현이었다). fade-up 을 시그니처에서 격하
- §13.1 신설 — 축소모션은 **첫 페인트 전에 해소**돼야 한다

**`ART_DIRECTION.md`**
- §3.3 — 이음선을 페이지의 척추로
- §3.4 — 비율 인코딩 하나로 통일, 6px 띠 삭제
- §3.7 — **거터 레일 삭제.** 실잉크 115px²=뷰포트의 0.0089% 로,
  과거 시각 충격 4.0 을 받은 0.018% 의 절반이었다
- §5 — **모바일을 자체 아트 디렉션으로** (±2%p 기하 검사 포함)
- §4/§4.1 — S2 이음선 88% 로 확정. 슬라이스 범위에 **S7(0%) · S9(100%) 추가**

**`DESIGN_SYSTEM.md`**
- §4 — 디스플레이 레지스터 26/30/56/72, 비율 40/96/176, 비율이 항상 최대
- §3 — 괘선 기판 대비 하한 1.6:1 (기존 1.18:1 로 사실상 비가시였다)
- §7 — 44px 히트 영역, 포커스 링은 전이하지 않는다

**`SCENE_GRAPH.md`**
- §0 — "씬 사이의 전이는 없다" **삭제** (저작된 전환 요구와 정면 충돌)
- S2 를 **제자리에서 재편성하는 단일 패널**로 재설계

**엔진**
- `graph.json` 의 `GOLDEN_REVIEW.gate.thresholds` 를 소유자 기준으로 상향.
  `composition` · `interactionQuality` 추가, 증거 최소치 4→8

### 설계를 바꾼 판단 하나 — 이 원리를 다른 장면에도 적용하라

비평가가 DirTree 칩 라벨이 토글에서 **역전**된다는 것을 증명했다
(`screens/landing` → `landing/screens`, `survivedCount: 0`). 같은 물체가 이동하는 것으로
읽히는 게 하나도 없었다는 뜻이다.

수정안은 **31개 불변 셀이 제자리에서 재편성**되는 단일 패널이고, 이것이 동시에
커밋 `91b3363` 의 정직한 서술이다 — **파일은 그대로였고 폴더 구조가 바뀌었다.**
전환이 콘텐츠의 진실과 일치하는 순간이 소유자가 요구한 "저작된" 것이다.

---

## 6. GOLDEN_FIX 에서 아직 해야 할 일

문서 개정은 끝났고 **코드가 그 문서를 아직 안 따라갔다.** 심사받은 그 상태 그대로다.

- [ ] `composition` 2.9 / `visualImpact` 2.8 — 내부 프레임 해체, 1920 우측 58.3% 공백 해결
- [ ] 히어로 Best-of-N **판정** (§4 의 증거 결함 셋을 먼저 해소)
- [ ] 모바일 자체 안무 — 640px 뷰포트에서 칩이 678px 이동하므로 시그니처 인터랙션이 부재.
      이동 거리를 줄이는 게 아니라 **모바일에서 성립하는 다른 전환**을 설계
- [ ] reduced-motion 을 설계된 대안으로. 현재 일반 캡처와 바이트 동일 =
      "애니메이션이 로드 실패한 화면"의 정의
- [ ] `accessibility` 6.8 — `Hero.tsx` 의 `useReducedMotion` 이 클라이언트 전용이라
      SSR 이 축소모션 사용자에게도 `opacity:0` 을 내보낸다 (CPU 6x 에서 1399ms).
      `EvidenceNote.tsx` 링크가 320px 에서 215.8×17px (44×44 하한의 39%, WCAG 2.2 AA 24×24 미달)
- [ ] `Gutter.tsx` 의 `transition-colors` 가 `outline-color` 를 포함해 포커스 링이 전이한다
- [ ] 이음선 50% vs 88% 문서 모순 — `DirTree.tsx` 주석이 아직 "50%" 라고 말한다.
      **코드 주석에만 사는 진실은 금지**
- [ ] S2 수용 기준 ① "두 트리가 처음부터 함께 보인다" 복구

---

## 7. 절대 규칙 (변경 없음)

- `state.json` 을 손으로 편집하지 마라. 전이는 `node scripts/graph.mjs` 만 통한다
- **사실을 발명하지 마라.** 콘텐츠는 `../_jadewisemann/ref/` **근거 등급 A/B 만**.
  이 런의 모든 수치는 등급 A 로 전수 추적됐다 — 그 수준을 유지하라
- 이 저장소는 **공개**다. PII 6종(생년월일 · 전화 · 거주지 · 병역 · 학점 · 증명사진)과
  팀원 실명은 들어가지 않는다. `src/forbidden-claims.test.ts` 가 기계 검사한다
- `../_jadewisemann/DESIGN.md` §3("포트폴리오 사이트를 만들지 않는다")은 소유자 결정으로
  **오버라이드됨**. 블로커로 재제기하지 마라. 그 외 판단(포지셔닝 v2 · 프로젝트 순서 ·
  금지 주장)은 유효하다
- 구현자가 자기 작업의 최종 판정권을 갖지 못한다. **디렉터 자체 채점이 이 런에서
  일관되게 관대했다**(자기 4.5 vs 실측 2.8). 네 점수와 비평가 점수가 벌어지면
  비평가 쪽을 채택하라
- 점수를 부풀려 게이트를 통과시키지 마라. 부풀린 9.0 은 실패한 런보다 나쁘다

---

## 8. 검증 명령

이 인수인계 시점에 **전부 통과**한 상태로 커밋했다.

```bash
npm run lint        # pass
npm run typecheck   # pass
npm test            # 5 files, 74 tests
npm run build       # 5 static routes: / /v1 /v2 /v3 /_not-found
npm run e2e         # 4 passed
node scripts/graph.mjs doctor
```

성능 실측(프로덕션 빌드, `performance-auditor`): 첫 로드 전송 270,893B ·
FCP 304/340ms · LCP 620/588ms · CLS 0.0(4조건 전부) · 유휴 3초 rAF 0건.
남은 감점: DirTree 31칩 토글이 CPU 4x 스로틀에서 58ms 롱태스크,
Turbopack 프로덕션 빌드가 route-size 표를 안 내보내 번들 회귀 가드가 없음,
`favicon.ico` 25,944B 가 CSS 전체보다 크다.
