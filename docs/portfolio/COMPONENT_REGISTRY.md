# Component Registry

리서치 시점: 2026-08-31 · 노드: COMPONENT_RESEARCH

채점은 `component-research` 스킬의 배점을 그대로 쓴다 (총 100점):
시각 충격 20 · 아트 디렉션 20 · 서사 유용성 15 · 인터랙션 품질 15 · 독창성 10 ·
모바일 7 · 성능 5 · 접근성 5 · 통합 위험 3. **85+ 강함 / 75~84 대체안 / 그 이하 반려.**

아트 디렉션은 아직 잠기지 않았다 (다음 노드가 ART_DIRECTION_BRANCH). 따라서 여기서는
**후보 목록과 잠정 판정**까지만 낸다. 최종 선택은 DIRECTION_JUDGE 이후에 확정한다.

## 0. 이 사이트가 실제로 필요한 인터랙션 (의도 기준으로 검색했다)

`BRIEF.md` §6 과 `CONTENT.md` 에서 역산한 것. 스타일 용어("멋있는 히어로")로 검색하지 않았다.

| # | 인터랙션 의도 | 근거가 되는 사실 |
|---|---|---|
| I1 | 포지셔닝 두 문장이 10초 독자에게 순서대로 도착한다 | `CONTENT.md` §1 |
| I2 | **파일 236개가 레이어 우선에서 도메인 우선으로 재편되는 것을 한 화면에서 본다** | `CONTENT.md` §2.5 |
| I3 | 측정값 두 개와 그 사이 흔들림 폭, 그리고 하한 눈금의 상대 위치를 본다 | `CONTENT.md` §2.3 |
| I4 | 같은 검증이 소스용 / 빌드 산출물용 두 벌로 갈라지는 구조를 본다 | `CONTENT.md` §2.4 |
| I5 | "내가 한 일"과 "내가 하지 않은 일"이 같은 폭으로 나란히 놓인다 | `CONTENT.md` §3.7 |
| I6 | 한 요청이 6개 문서를 원자적으로 바꾸는 것을 본다 | `CONTENT.md` §4.2 |
| I7 | 수치마다 분모 · 근거 경로 · 등급이 값에서 떨어지지 않는다 | `BRIEF.md` §7 |
| I8 | 문서 어디에 있는지, 그리고 각 판단이 무슨 종류인지 주변시로 안다 | 기존 `src/components/Gutter.tsx` |

**중요한 자산 제약**: 프로젝트 이미지 · 스크린샷 · 영상이 **하나도 없다**
(`CONTENT.md` §8 확보되지 않은 것). 이미지를 전제한 후보는 전부 탈락한다 —
캐러셀 · 벤토 그리드 · 3D 카드 · 이미지 트레일 · 마스크 리빌 계열.

## 1. 이 저장소가 이미 강제하는 제약 (후보 반려 사유가 된다)

`src/motion-ownership.test.ts` 가 소스에서 기계적으로 금지하는 것:

- `gsap` · `lenis` import 및 `package.json` 의존성
- `useScroll` · `useTransform` · `scrollYProgress` (Motion 으로 스크럽 재발명)
- `transition-all` · `will-change` · `@keyframes` / `animation:` (스스로 시작하는 애니메이션)
- `filter: blur` · `backdrop-filter` · 바깥으로 나가는 `box-shadow`
- `scroll-behavior`

이 게이트는 이미 통과 중이다. 이걸 깨는 후보는 점수와 무관하게 반려다 —
게이트를 후보에 맞춰 고치는 것은 순서가 거꾸로다.

---

## 2. 후보 평가

### C1 — Magic UI · File Tree ✅ 채택 (I2)

| 항목 | 값 |
|---|---|
| 출처 | https://magicui.design/docs/components/file-tree |
| 설치 | `npx shadcn@latest add "https://magicui.design/r/file-tree.json"` (레지스트리 JSON: https://magicui.design/r/file-tree.json) |
| 의존성 | MCP 레지스트리 조회 결과 `dependencies: []` · `registryDependencies: []` — 설치 시 실제 import 를 재확인한다 |
| 애니메이션 기술 | 접힘/펼침 상태 전이 (Motion 기반) |
| 라이선스 | MIT (Magic UI) |
| 의도 씬 | S-restructure — 236파일 도메인 우선 재편 |
| 필요한 커스터마이즈 | 크다. 아이콘 · 색 강조 제거, 등폭 조판, **두 트리(이전/이후)를 같은 노드 아이덴티티로 잇는 shared layout 전이**는 없으므로 직접 넣는다 |

| 항목 | 점수 |
|---|---:|
| 시각 충격 | 15 / 20 |
| 아트 디렉션 | 16 / 20 |
| 서사 유용성 | **15 / 15** — 이 사이트에서 가장 큰 사실(236파일)의 유일한 시각 형태 |
| 인터랙션 품질 | 11 / 15 |
| 독창성 | 5 / 10 — 흔한 형태다. 독창성은 "두 구조 사이의 전이"에서 나온다 |
| 모바일 | 5 / 7 — 깊은 트리는 320px 에서 들여쓰기가 무너진다. 깊이 2 로 잘라야 한다 |
| 성능 | 5 / 5 |
| 접근성 | 3 / 5 — 트리 시맨틱(`role="tree"`/`treeitem`) 확인 필요 |
| 통합 위험 | 2 / 3 |
| **합계** | **77 / 100 — 대체안 등급** |

판정: **골격만 채택.** 점수가 강함(85+)에 못 미치는 이유가 정확히 "전이가 없다"이고,
그 전이가 이 씬의 서사 전부다. 따라서 이 컴포넌트는 **정적 트리 렌더의 참조 구현**으로만
쓰고, 이전↔이후 전이는 Motion `layout` 으로 직접 만든다.
소스 예산: 기존 `src/motion-ownership.test.ts` 의 허용 목록에 이미
`src/components/DirTree` 가 등록되어 있다 — 이 결정과 일치한다.

### C2 — Magic UI · Code Comparison ⚠️ 조건부 (I4, S-e2e)

| 항목 | 값 |
|---|---|
| 출처 | https://magicui.design/docs/components/code-comparison |
| 라이선스 | MIT |
| 애니메이션 기술 | 정적 (탭 전환) |
| 의도 씬 | 두 벌 검증 하네스 — MSW(소스) vs Playwright 페이크(빌드 산출물) |

| 항목 | 점수 |
|---|---:|
| 시각 충격 | 11 / 20 · 아트 디렉션 15 / 20 · 서사 유용성 13 / 15 · 인터랙션 9 / 15 · 독창성 4 / 10 · 모바일 4 / 7 · 성능 5 / 5 · 접근성 4 / 5 · 통합 2 / 3 |
| **합계** | **67 / 100 — 반려** |

판정: **반려.** 두 코드 블록을 나란히 두는 것은 320px 에서 성립하지 않고, 이 씬의 핵심은
코드 diff 가 아니라 **"왜 두 벌이 필요한가"**(프로덕션 빌드에서 MSW 가 컴파일 아웃된다)다.
텍스트 한 줄이 코드 두 벌보다 강하다. 기존 `src/components/CodeBlock.tsx` 로 충분하다.

### C3 — Magic UI · Animated Beam ❌ 반려 (I6)

| 항목 | 값 |
|---|---|
| 출처 | https://magicui.design/docs/components/animated-beam |
| 애니메이션 기술 | SVG path + 무한 반복 그라디언트 이동 |

판정: **반려. 채점 전 탈락.** 사용자 행동 없이 스스로 무한 재생하므로
`motion-ownership.test.ts` 의 "스스로 시작하는 애니메이션이 없다"를 위반한다. 또한 6개
문서 갱신의 서사는 "빛이 흐른다"가 아니라 **"전부 성공하거나 전부 없다"**다 —
빔은 부분 성공처럼 읽혀서 사실과 반대 방향으로 오해를 만든다.

### C4 — Magic UI · Number Ticker ❌ 반려 (I3, I7)

| 항목 | 값 |
|---|---|
| 출처 | https://magicui.design/docs/components/number-ticker |

판정: **반려.** (a) 뷰포트 진입만으로 스스로 시작한다. (b) 이 사이트의 규칙은
**"맨 숫자를 화면에 놓을 수 없다"**(`src/lib/reading.ts` 의 `denominator` 필수 타입)인데,
카운트업은 숫자를 분모에서 떼어내 단독 스펙터클로 만든다. 이 사이트의 주장과 정면 충돌한다.
`CONTENT.md` §2.8 은 "커버리지 96%는 본인이 정한 분모 기준"을 함께 적으라고 요구한다.

### C5 — Magic UI · Terminal ⚠️ 형태만 차용

| 항목 | 값 |
|---|---|
| 출처 | https://magicui.design/docs/components/terminal |
| 애니메이션 기술 | 타이핑 시퀀스 (자동 재생) |

판정: **애니메이션 반려, 형태 차용.** 자동 타이핑은 위 게이트 위반이다. 그러나
"검증 명령을 그대로 보여준다"는 것은 이 사이트에 필요하다 — `ref/projects/yorr.md` §4.1 의
교훈이 **"검증 명령을 적어놨는데 그 명령이 다른 답을 낸다"** 였기 때문이다. 명령을 정적
등폭 블록으로 보여주고 실행 결과를 함께 적는다. 기존 `CodeBlock.tsx` 로 처리한다.
점수: 시각 8 / 디렉션 12 / 서사 12 / 인터랙션 5 / 독창성 3 / 모바일 5 / 성능 5 / 접근성 4 /
통합 3 = **57 / 100 — 반려**.

### C6 — React Bits · SplitText ❌ 반려 (I1)

| 항목 | 값 |
|---|---|
| 출처 | https://reactbits.dev/text-animations/split-text · 저장소 https://github.com/DavidHDev/react-bits |
| 애니메이션 기술 | **GSAP** (+ ScrollTrigger 계열) |
| 라이선스 | MIT (일부 컴포넌트에 별도 표기 있음 — 채택 시 개별 확인) |

판정: **반려.** `gsap` 의존성이 `motion-ownership.test.ts` 의 두 테스트를 동시에 깬다
(import 금지 · `package.json` 금지). GSAP 를 되살리려면 MOTION_LANGUAGE 를 먼저 고쳐야
하는데, 스크롤 오프셋의 함수인 속성이 0개인 현재 설계에서 GSAP 소비자가 없다.
글자 단위 분해 자체도 한글 조판에서 위험하다 — 어절 중간 끊김 방지(`word-break: keep-all`)와
충돌한다. 기존 `src/components/Hero.tsx` 의 **줄 단위** Motion 전이가 더 정확하다.

### C7 — React Bits · ScrollReveal ❌ 반려

| 항목 | 값 |
|---|---|
| 출처 | https://reactbits.dev/text-animations/scroll-reveal |
| 애니메이션 기술 | GSAP ScrollTrigger |

판정: **반려.** 위와 같은 사유. 추가로 "스크롤하면 글이 뜬다"는 이 사이트의 서사에
아무것도 더하지 않는다 — 문서는 처음부터 읽히는 것이 정직하다.

### C8 — Aceternity UI · Animated Tabs ⚠️ 대체안 (I5)

| 항목 | 값 |
|---|---|
| 출처 | https://ui.aceternity.com/components/tabs · 미러 https://21st.dev/@manuarora700/library/aceternity-ui |
| 애니메이션 기술 | Motion `layoutId` 로 활성 배경 이동 |
| 라이선스 | 무료 컴포넌트 (Aceternity 웹사이트 기준) |
| 의도 씬 | "한 일 / 하지 않은 일" 전환 |

| 항목 | 점수 |
|---|---:|
| 시각 충격 | 12 / 20 · 아트 디렉션 13 / 20 · 서사 유용성 8 / 15 · 인터랙션 13 / 15 · 독창성 4 / 10 · 모바일 6 / 7 · 성능 5 / 5 · 접근성 3 / 5 · 통합 3 / 3 |
| **합계** | **67 / 100 — 반려** |

판정: **반려.** 탭은 한쪽을 숨긴다. 이 씬의 요구는 정반대다 — **하지 않은 일이 한 일과
같은 폭으로 동시에 보여야** 한다(`CONTENT.md` §3.7). 탭으로 감추면 이 사이트의 가장 큰
차별점이 클릭 뒤로 숨는다. 다만 `layoutId` 기법 자체는 C1 의 트리 전이에 유효하다 —
**차용하는 것은 기법 하나뿐**이다.

### C9 — Aceternity UI · Container Scroll Animation ❌ 반려 (선례 있음)

| 항목 | 값 |
|---|---|
| 출처 | https://ui.aceternity.com/components/container-scroll-animation |

판정: **반려.** `useScroll` + `useTransform` 으로 스크롤 스크럽을 만들므로
`motion-ownership.test.ts` 의 "Motion 으로 스크럽을 재발명하지 않는다"를 정면 위반한다.
이 반려는 이번이 처음이 아니다 — 기존 소스 주석이 같은 사유로 이 컴포넌트를 반려한 것을
기록하고 있다(`src/motion-ownership.test.ts`). **같은 후보를 다시 채택하지 않는다.**
또한 3D 기울기 목업 안에 넣을 스크린샷이 없다(`CONTENT.md` §8).

### C10 — Codrops · Sticky Grid Scroll ⚠️ 기법 참고

| 항목 | 값 |
|---|---|
| 출처 | https://tympanus.net/Tutorials/StickyGridScroll/ · 색인 https://tympanus.net/codrops/tag/grid/ |
| 애니메이션 기술 | GSAP + sticky 그리드 |
| 라이선스 | Codrops 튜토리얼 코드는 상업적 사용 허용, 재배포 금지 (사이트 라이선스 확인 필요) |

판정: **구현 반려, 원리 참고.** GSAP 이므로 코드는 쓸 수 없다. 다만 **sticky 컨테이너 안에서
구조가 단계적으로 펼쳐지는 골격**은 C1 트리 씬의 레이아웃 참고가 된다. 스크롤 스크럽 없이
IntersectionObserver 의 불리언 + CSS 전이로 같은 효과의 축소판을 만들 수 있다 —
기존 `Gutter.tsx` 가 이미 그 패턴이다.
점수: 시각 17 / 디렉션 10 / 서사 6 / 인터랙션 12 / 독창성 7 / 모바일 4 / 성능 3 / 접근성 2 /
통합 0 = **61 / 100 — 반려**.

### C11 — Radix UI · Collapsible ✅ 채택 후보 (C1 의 접근성 바닥)

| 항목 | 값 |
|---|---|
| 출처 | https://www.radix-ui.com/primitives/docs/components/collapsible |
| 라이선스 | MIT |
| 의존성 | `@radix-ui/react-collapsible` (런타임 1개) |

판정: **조건부 채택.** C1 의 접근성 점수(3/5)를 메우는 유일한 저렴한 수단이다. 단,
트리 전이가 Motion `layout` 소유이므로 **Radix 의 자체 열림 애니메이션(CSS 변수 기반
`data-state` 키프레임)은 끈다** — 켜면 같은 속성에 두 소유자가 생긴다
(`MOTION_LANGUAGE` 위반). 애니메이션 없이 상태 · 시맨틱만 쓴다.
점수: 시각 2 / 디렉션 12 / 서사 6 / 인터랙션 10 / 독창성 1 / 모바일 7 / 성능 5 / 접근성 5 /
통합 3 = **51 / 100** — 시각 배점이 낮은 프리미티브라 총점은 의미 없다. **접근성 보조로만
채택**하고, 트리를 순수 마크업 + `role="tree"` 로 직접 쓰는 안과 GOLDEN_SLICE 에서 비교한다.

---

## 3. 직접 만들 것 (기성품이 없어서)

기성품 검색이 실패한 것만 여기 온다. 실패 이유를 적는다.

| ID | 컴포넌트 | 왜 기성품이 없나 | 상태 |
|---|---|---|---|
| B1 | `MeasurementBar` — 임의 위치 하한 눈금 + 두 실측값 사이 흔들림 폭 | 기성 Meter · Progress · 게이지는 **임의 위치에 눈금을 꽂는 옵션을 주지 않는다.** 이 씬의 서사는 막대 길이가 아니라 **하한 눈금의 위치**다 (`CONTENT.md` §2.3) | **이미 구현됨** (`src/components/MeasurementBar.tsx`) |
| B2 | `GutterRail` — 판단 기호 레일 (목차 · 현재 위치 · 판단 종류 분포를 겸함) | 기성 스크롤 진행바 · 목차는 "종류"를 표현하지 않는다. 기호 어휘(− + ~ ↺ =)가 이 사이트 고유 | **이미 구현됨** (`src/components/Gutter.tsx`) |
| B3 | `DirTree` — 이전/이후 구조를 같은 노드 아이덴티티로 잇는 트리 | C1 참조 + Motion `layout`. 기성품에 전이가 없음 | **미구현** |
| B4 | `EvidenceNote` · `HarnessTable` · `DecisionBlock` · `DecisionIndex` · `CodeBlock` · `HashFocus` | 수치에서 분모 · 근거 · 등급이 떨어지지 않게 강제하는 것은 이 저장소 고유 규칙 | **이미 구현됨** |
| B5 | 금지 문구 검사 게이트 (`CONTENT.md` §9 를 빌드 산출물에서 grep) | 존재할 수 없는 종류의 기성품 | **미구현** |

`src/lib/reading.ts` 의 타입이 이미 이 규칙을 강제한다: `grade` 가 `"A" | "B"` 이고
`denominator` 와 `source` 가 필수다. **등급 D 수치는 타입 수준에서 표현 불가능하다.**

---

## 4. 결론

- 외부 라이브러리에서 **새로 들여올 런타임 의존성은 최대 1개**
  (`@radix-ui/react-collapsible`, 그것도 조건부).
- 새로 쓸 코드는 C1 의 형태를 참조한 `DirTree` 하나.
- 나머지는 이미 이 저장소에 있다.
- 반려 사유의 대부분이 **"이 저장소의 모션 소유권 게이트를 깬다"** 이고, 그 게이트는
  포지셔닝 둘째 문장("품질을 도구가 지키게 만들었다")의 실물이다. 게이트를 후보에 맞춰
  느슨하게 만들면 이 사이트가 하는 주장이 무너진다.

미해결로 남기는 것: 시각 충격 20점을 어디서 가져오는가. C1~C11 의 최고 시각 점수가
17/20(Codrops, 그러나 사용 불가)이고 채택 후보의 최고가 15/20 이다. **기성품 조합으로는
GOLDEN_REVIEW 의 시각 충격 임계값 9 를 넘지 못한다.** 이것은 아트 디렉션이 풀어야 하는
문제이며, ART_DIRECTION_BRANCH 의 세 방향 각각이 이 질문에 답해야 한다.
