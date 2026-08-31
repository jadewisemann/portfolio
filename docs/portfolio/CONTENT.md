# Content Inventory

사실 원장. **모든 행에 출처 경로와 근거 등급이 있다.** 출처는 형제 저장소
`../_jadewisemann` 기준 상대 경로다. 등급 정의는 `ref/20_evidence.md` §등급 정의.

- 등급 **A**: 코드 · git · 팀 공식 문서로 검증됨. 그대로 사용 가능.
- 등급 **B**: 설계 의도 · 구조로 뒷받침됨. 표현을 완화하면 사용 가능.
- 등급 C · D 는 이 원장에 **들어오지 못한다**. (D 목록은 §9 에 금지 항목으로만 적는다.)

이 저장소는 공개다. 팀원 실명 · PII 는 옮겨 적지 않는다 (`BRIEF.md` §5.2).

---

## 1. 헤드라인

| 문장 | 등급 | 출처 |
|---|:-:|---|
| 6인 팀의 프론트엔드를 혼자 맡아 실시간 멀티플레이 게임 플랫폼을 완성했다. | A | `DESIGN.md` §1 v2 · `ref/20_evidence.md` A행("YORR는 2026-07-21~08-13 … 본인이 유일한 프론트엔드 개발자") |
| 리뷰어가 없었으므로, 품질은 리뷰 대신 테스트 · 린트 · 훅이 지키게 만들었다. | A | `DESIGN.md` §1 v2 · `ref/projects/yorr.md` §2 비교표 |

## 2. 프로젝트 1 — YORR (1순위, 히어로)

### 2.1 사실

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| 무엇 | 휴대폰을 컨트롤러로 쓰는 모바일 실시간 멀티플레이 게임 플랫폼 (야추 · 탁구 · 듀얼) | A | `ref/projects/yorr.md` §1 |
| 기간 | 2026-07-21 ~ 2026-08-13 (약 3.5주) | A | `ref/20_evidence.md` A행 |
| 팀 | 6명 — BE 3 · AI 1 · Infra 1 · **FE 1 (본인 단독)** | A | `ref/projects/yorr.md` 개요표 · `ref/20_evidence.md` A행 |
| 본인 커밋 | 81 (비-머지) + 103 (develop 통합 머지) | A | `ref/projects/yorr.md` 개요표 (2026-08-13 실측) |
| 프론트 코드량 | 약 52,000 LOC (`.ts` 249 + `.tsx` 198 파일) | A | `ref/projects/yorr.md` 개요표 · §5 이력서 문장 |
| 공개 근거 | https://github.com/jadewisemann/yorr (미러) | A | `DESIGN.md` §2 |
| 스택 (본인 담당) | React 19 · Vite 8 · TypeScript 7 · TanStack Router · Zustand · Tailwind 4 · motion · Three.js 0.180 + Rapier3D · WebSocket · WebRTC(음성) | A | `ref/projects/yorr.md` 개요표 |
| 품질 도구 | Biome · Vitest 4 + v8 coverage · Playwright · MSW · dpdm | A | `ref/projects/yorr.md` 개요표 |

### 2.2 설계 판단 3개 (본인이 쓴 `frontend/docs/architecture.md`)

| 원칙 | 내용 | 등급 | 출처 |
|---|---|:-:|---|
| 서버 상태를 화면으로 | 상태의 최종 권위자는 서버 | A | `ref/projects/yorr.md` §1 |
| 센서를 게임 입력으로 | 원시 센서값을 서버로 보내지 않고 **판정된 이벤트만** 전송 | A | `ref/20_evidence.md` A행 (커밋 `a83c6fe`·`c0b556c`) |
| 연출은 로컬에서 | 3D 물리 · 진동 · 소리는 전부 클라이언트 | A | `ref/projects/yorr.md` §1 |

### 2.3 커버리지 래칫 — 이 사이트의 핵심 소재

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| 설정한 하한 | statements 96 · branches 91 · functions 96 · lines 98 | A | `frontend/vitest.config.ts` 인용 → `ref/projects/yorr.md` §3.1 |
| 당시 실측값 | statements 96.33 · branches 91.94 · functions 96.63 · lines 98.40 | A | 같은 파일 주석 |
| 분모 설계 | `include: ['src/**/*.{ts,tsx}']` — 테스트가 import 한 파일만 세면 한 번도 실행되지 않은 소스가 분모에서 빠진다 | A | 같은 파일 주석 · `ref/20_evidence.md` A행 |
| 흔들리는 파일 | `World.ts` — 렌더 루프가 `performance.now()` 로 실제 프레임 간격을 재고 그 값이 accumulator 반복 횟수와 clamp 분기를 좌우함 | A | `ref/projects/yorr.md` §3.1 |
| 흔들림 폭 | 그 파일의 branches 71.71% ~ 84.84% | A | 같은 주석 |
| 특정 방법 | **같은 테스트 2회 실행 비교** — 전역 branches 90.48% vs 91.43% | A | 같은 주석 · `ref/20_evidence.md` A행 |
| 검토한 대안 | thresholds 의 파일별 glob 하한 → 전역 분모에서 빼주지 않음을 검증 | A | 같은 주석 |
| 선택 | 측정에서만 제외. **테스트 48개는 그대로 돌며 물리 거동을 검증** | A | 같은 주석 (§4.3 정정: 47 → 48) |
| 근본 해결책 | `World.ts` 가 시간을 주입받고 테스트가 가짜 시계를 넣는 것 — 렌더 루프 수정이 필요해 별도 작업으로 유예 | A | 같은 주석 |

⚠️ **표현 제약**: 이 하한은 **CI 가 강제하지 않는다.** Jenkins 는 커버리지가 꺼진
`npm test` 를 돌린다 (`ref/projects/yorr.md` §4.2). 화면에는 "로컬 게이트"로 쓰고,
"CI 가 강제한다"는 절대 쓰지 않는다.

### 2.4 E2E 2단 하네스

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| 규모 | 18스펙 — mock 14 + real 4 | A | `ref/20_evidence.md` A행 (§4.3 정정: 17 → 18) |
| 왜 두 벌인가 | 프로덕션 빌드에서는 MSW 가 컴파일 아웃되므로, 소스를 검증하는 MSW 와 빌드 산출물을 검증하는 Playwright 페이크가 별도로 필요 | A | `ref/projects/yorr.md` §3.2 |
| 계약 미러 | `contract.ts` — 와이어 계약이 바뀌면 테스트 인프라가 먼저 깨지게 함 | A | 같은 절 |
| 실행 대상 | Playwright 프로젝트 4종 — mobile-chrome(Pixel 7) · mobile-safari(iPhone 15) · mobile-320 · desktop-chrome | A | 같은 절 |
| 320px 판정 | `narrow-width.spec.ts` — 스크린샷 비교가 아니라 **요소의 위치와 크기로 넘침을 판정**하고 넘친 요소 이름을 짚음 | A | `ref/20_evidence.md` A행 |

### 2.5 도메인 우선 구조 재편

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| 규모 | 236파일 재편 (커밋 `91b3363`) | A | `ref/20_evidence.md` A행 |
| 이전 상태 | 레이어 우선 — 야추 하나를 이해하려고 7개 폴더를 뒤져야 했고, `components/` 한 폴더에 랜딩 카드 · 게임판 · 로비 패널 · 공용 버튼이 평평하게 섞임 | A | `ref/projects/yorr.md` §3.3 (본인 `architecture.md` 인용) |
| 이후 | 게임 하나를 추가하는 일이 폴더 하나를 만드는 일이 됨 | A | 같은 절 |
| 기계 검사 | `dpdm --circular` (`npm run check:cycles`) 로 도메인 간 단방향 의존 검사 | A | `ref/20_evidence.md` A행 |

⚠️ `check:cycles` 도 Jenkinsfile 에 없다 (`ref/projects/yorr.md` §4.2). "CI 에서 강제" 금지.

### 2.6 롤백 판단

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| 사실 | 본인이 작성한 404파일 규모 리팩터링이 배포 회귀를 일으키자 롤백을 판단 · 실행 | A | `ref/20_evidence.md` A행 (커밋 `8f9f52f`·`d84c6d4`) |

### 2.7 그 외 (커밋 근거 있음)

| 영역 | 근거 커밋 | 등급 | 출처 |
|---|---|:-:|---|
| 재접속 · 세션 복원 | `c0b556c` sessionToken 기반 게임 상태 복원 · `5659ecf` 방 세션 40분 만료 영속화 · `7ceb700` heartbeat 생존 판정 | A | `ref/projects/yorr.md` §3.5 |
| 서버 권위 동기화 | `86f6e56` 주사위 결과 서버 권위 동기화 · `416a22f` 물리 예측 · 재생 안정화 | A | 같은 절 |
| 지연 보상 | `a83c6fe` 탁구 스윙 판정에 업링크 지연 보상 (FE+BE) | A | 같은 절 |
| 레이스 컨디션 | `7b7dc2e` 마감 지난 예약이 유실돼 방이 멈추던 레이스 | A | 같은 절 |
| 모바일 강건성 | `44b6f69` 좁은 폭 강건성 (51파일) · `0f28a2d` 모바일 초대코드 밀림 | A | 같은 절 |
| 문서 분리 | `879aa7a` 프론트 문서를 사람용 / LLM용으로 분리 | A | `ref/projects/yorr.md` §3.4 |

### 2.8 과장 금지 — 화면에 함께 적을 것

| 사실 | 출처 |
|---|---|
| 3.5주 프로젝트다. "장기 운영"이 아니다. | `ref/projects/yorr.md` §6 |
| 백엔드(Spring Boot, `.java` 267파일)는 팀원 담당. 본인의 FE+BE 동시 수정은 6건이고 전부 프론트와 맞물린 부분. | 같은 절 |
| 본인 비-머지 커밋 81건 중 **16건에 `Co-Authored-By: Claude` 트레일러**가 있다. | 같은 절 |
| 커버리지 96%는 **본인이 정한 분모 기준**이다. 분모 설계를 함께 설명해야 의미가 있다. | 같은 절 |
| `s15-Yorr` 조직 저장소는 비어 있다. 공개 근거는 미러뿐이다. | 같은 절 · `DESIGN.md` §2 |

---

## 3. 프로젝트 2 — FestiFriends (2순위)

### 3.1 사실

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| 무엇 | 리뷰 기반 신뢰도 + 실시간 채팅으로 공연 동행을 매칭하는 플랫폼 | A | `ref/projects/festifriends.md` 개요 |
| 기간 | 2025.04 ~ 2025.06 (기획 포함) / git 실측 2025-05-20 ~ 2025-07-07 | A | `ref/20_evidence.md` A행 · `ref/02_timeline.md` |
| 팀 | 8명 — FE 5 · BE 2 · 디자이너 1 | A | `ref/20_evidence.md` A행 |
| 본인 역할 | PM · 형상 관리 · 공연 목록 · 찜 · 모임 개설 페이지 | A | 팀 발표자료 → `ref/20_evidence.md` A행 |
| 본인 커밋 | 59 (팀 253, 기여자 10) | A | `ref/projects/festifriends.md` §기여도 |
| 최초 생성 | 공통 컴포넌트 13개 (팀 53) · 커스텀 훅 8개 · 테스트 파일 20개 (팀 60) | A | 같은 절 |
| 데모 | https://ff-frontend-rust.vercel.app/ | A | 개요표 |
| 저장소 | https://github.com/FestiFriends/ff_frontend | A | 개요표 |
| 스택 | Next.js 15 (App Router) · React 19 · TypeScript 5.7 · Tailwind 4 · Zustand 5 · TanStack Query 5 · React Hook Form · Zod · Radix UI · Jest · MSW · RTL | A | 개요표 |

### 3.2 팀 개발환경 단독 세팅 (본인 커밋 59개 중 약 25개, 05-20 ~ 05-29)

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| ESLint | 11커밋. `no-var` · `eqeqeq` · `func-style` · `react/jsx-no-bind` · `naming-convention`(헝가리안 금지) · `import/order` · `jsx-a11y` 등 커스텀 룰 직접 정의 | A | `ref/20_evidence.md` A행 · `ref/projects/festifriends.md` 구간① |
| 파일명 · 폴더명 | `eslint-plugin-filenames` / `eslint-plugin-folders` 로 컴포넌트 PascalCase · 유틸 camelCase · 폴더 kebab-case 를 **린트로 강제** | A | 같은 절 (코드 인용) |
| Git 훅 | `commit-msg` → commitlint (conventional + 커스텀 type-enum 10종) · `pre-push` → lint:fix → `npm i` → test → build | A | 같은 절 |
| 테스트 환경 | Jest + MSW 구축 | A | 같은 절 |
| 템플릿 | PR 템플릿 · 이슈 템플릿 (bug.yml · feat.yml) | A | 같은 절 |

### 3.3 컴포넌트를 문서 · 테스트와 함께 제공

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| 규칙 | 컴포넌트 옆에 `.md` 문서를 두는 규칙을 본인이 만들고 지킴. Storybook 없이 사용법을 찾게 함 | A | `ref/20_evidence.md` A행 (ButtonGroup · TimePicker · RadioGroup) |
| 형태 | `ButtonGroup.tsx` + `.test.tsx` + `.md` + `ButtonGroupMessage.tsx` (문구 분리) | A | `ref/projects/festifriends.md` 구간② |

### 3.4 headless 컴파운드 컴포넌트 재설계

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| 문제 | 같은 공연 카드가 목록 · 상세 · 찜 페이지에서 각기 다른 조합으로 필요 | A | `ref/projects/festifriends.md` 구간③-B |
| 선택 | props 를 늘리는 대신 Context 기반 headless 컴파운드로 분해 (커밋 `[Refactor/issue-254]`) | A | `ref/20_evidence.md` A행 |
| 접근성 디테일 | `onCardClick` 이 있을 때만 `role='button'` · `tabIndex=0` · `aria-label` · Enter/Space 핸들러를 부여 → 클릭 핸들러가 없으면 스크린리더에 가짜 버튼이 생기지 않게 함 | A | 같은 절 (코드 인용) |
| 안전장치 | Root 밖에서 쓰면 컨텍스트 훅이 즉시 throw | A | 같은 절 |

### 3.5 대표 트러블슈팅 — 무한 렌더링

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| 커밋 | `[Fix/issue-284]` → https://github.com/FestiFriends/ff_frontend/commit/786efc5285bf72f1ac980659a3c269cb7e75f71d | A | `ref/projects/festifriends.md` 구간③-C |
| 원인 | `useQueryParam` 이 반환하는 함수 5개 중 `getQueryParam` 만 `useCallback` 이 없어 렌더마다 새 참조가 생기고, 그것이 `useEffect` 의존성에 있어 effect → setState → 리렌더 → 새 참조 → effect 재실행으로 순환 | A | `ref/20_evidence.md` A행 ("원인은 useEffect 의존성이었고 직접 진단 · 수정") |
| 조치 | 원인 제거(의존성에서 불안정한 참조 제거) + 재발 방지(핸들러 `useCallback` 안정화) + 프로세스 개선(pre-push 훅에 `npm i` 의존성 재확인 추가) | A | 같은 절 (diff 인용) |

### 3.6 그 외 (본인 단독 근거)

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| URL 상태 관리 | 필터 · 정렬 · 페이지네이션을 URL 쿼리로 관리하고 TanStack Query 의 query key 와 연결 → 새로고침 · 복귀 시 조건 유지. 이후 4차례 리팩토링 | A | `ref/projects/festifriends.md` 구간③-A |
| Zod 스키마 | `src/schema/groupsCreate.ts` 단독 작성 (4/4 커밋). ageRange min≤max `refine` 교차 검증 | A | `ref/20_evidence.md` A행 |
| BE 협업 | 모임 개설 API 스펙 불일치를 프론트에서 발견해 맞춤 (`[Bug/issue-438]`) | A | `ref/20_evidence.md` A행 |
| 훅 | `useDragScroll` · `MobileWrapper` 본인 개발 | A | `ref/20_evidence.md` A행 |

### 3.7 🔴 본인 관여 없음 — 어디에도 쓰지 않는다

| 항목 | 출처 |
|---|---|
| STOMP + SockJS 실시간 채팅 (담당자 별도, 본인 커밋 0) | `ref/projects/festifriends.md` §본인 관여 없음 · `ref/20_evidence.md` D1 |
| SSE 알림 스토어 · 401 재연결 (담당자 별도, 본인 커밋 0) | 같은 절 · D2 |
| `ff_backend` (본인 커밋 0) | 같은 절 |
| 완곡한 표현("코드베이스를 다뤘습니다", "리뷰하며 이해했습니다")도 쓰지 않는다 | 같은 절 |
| 팀 전체 지표(60 스위트 · 663 테스트 · Statements 80.43%)는 **팀 성과**로만 표기 | `ref/20_evidence.md` A행 |
| Core Web Vitals 수치 — README 에 "실제 측정 데이터 추가 필요"로 명시됨 → 인용 금지 | `ref/projects/festifriends.md` §팀 전체 성과 |

안전 표현 (그대로 사용 가능): "Jest/MSW 테스트 환경과 pre-push 게이트를 구축해,
팀 전체가 60 스위트 · 663 테스트를 유지하는 기반을 만들었습니다."

---

## 4. 프로젝트 3 — Pookjayo (3순위)

### 4.1 사실

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| 무엇 | 모바일 우선 숙박 검색 · 예약 · 결제 플랫폼 | A | `ref/projects/pookjayo.md` 개요 |
| 기간 | 2025.02 ~ 2025.04 (기획 포함 8주 / 개발 5주) · git 실측 2025-03-05 ~ 2025-04-07 | A | `ref/20_evidence.md` A행 |
| 팀 | FE 5명 | A | `ref/20_evidence.md` A행 |
| 본인 역할 | 팀장 / PM / FE 아키텍처 / 서버리스 함수 로직 | A | 팀 README → `ref/projects/pookjayo.md` §README 기재 |
| 본인 커밋 | 274 (머지 제외 234) — 전체 692 중 **팀 내 최다** | A | `ref/20_evidence.md` A행 |
| 단독 작성 영역 | `src/firebase` 5/5 · `functions/src` 10/10 커밋 · `src/utils` 4/4 · `src/store` 7/8 | A | `ref/20_evidence.md` A행 · `ref/projects/pookjayo.md` §기여도 |
| 데모 | https://pookjayo.vercel.app/ | A | 개요표 |
| 저장소 | https://github.com/jadewisemann/Pookjayo | A | 개요표 |
| 스택 | React 19 · JavaScript · Vite · Tailwind 4 · Zustand · React Router · Firebase (Firestore/Functions/Auth) · IndexedDB · Python (BS4 + Selenium) | A | 개요표 |

### 4.2 예약 · 결제 트랜잭션

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| 규모 | `functions/src/payment/process-payment.js` 310줄 단독 작성 | A | `ref/20_evidence.md` A행 |
| 한 요청이 바꾸는 문서 | 6개 — `reservations` · `rooms.reservedDates` · `availability.dates` · `search_index.reservedDates` · `users.points` + `point_history` · `transactions` | A | `ref/projects/pookjayo.md` §핵심 구현 1 |
| 중복 예약 차단 | 같은 방의 `status == 'confirmed'` 예약을 **트랜잭션 안에서 읽고** 판정 | A | 같은 절 (코드 검증 완료) |
| 파생 데이터 정합성 | 검색 인덱스와 잔여 객실을 같은 트랜잭션에서 갱신 → "검색에는 남아 있는데 예약은 불가"한 상태를 만들지 않음 | A | 같은 절 |
| 인지한 한계 | Firestore 트랜잭션은 외부 결제 API 까지 원자적으로 보장하지 않음. OCC 재시도 시 중복 호출 위험 → 외부 호출 구간을 트랜잭션 밖으로 분리 | B | `ref/20_evidence.md` B등급 표 |
| 쓰기 차단 | `firestore.rules` 9줄 — `allow write: if false` 로 클라이언트 쓰기를 DB 레벨에서 전면 차단해 모든 변경이 Cloud Functions 를 거치게 강제 | A | `ref/20_evidence.md` A행 |
| 그 규칙의 한계 | `read: if true` 라서 사용자 문서까지 공개 읽기 가능. 다시 하면 컬렉션별 read 분리 + `request.auth.uid == resource.id` | A | `ref/projects/pookjayo.md` §보안 규칙 |

### 4.3 FSM 결제 상태

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| 상태 | `IDLE` · `DATA_LOADED` · `PROCESSING` · `COMPLETED` · `ERROR` (코드 기준) | A | `ref/20_evidence.md` A행 (D23: 다른 상태명 기재 금지) |
| 구조 | 전이표를 선언하고 `canTransitionTo` 로 검증한 뒤에만 상태를 바꿈. 실패 시 로그를 남기고 상태를 바꾸지 않음 | A | `src/store/reservationStore.js:96` → `ref/20_evidence.md` A행 |
| 결과 | `PROCESSING` 의 허용 전이에 자기 자신이 없어 **중복 결제 요청이 구조적으로 거부됨** — "버튼 disabled" 보다 강한 근거 | A | 같은 행 |
| 세션 | 상태별 진입 타임스탬프 기록 + `SESSION_MAX_AGE` 로 세션 만료 판정 | A | 같은 행 |

### 4.4 검색 구조

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| 규모 | `src/firebase/searchQuery.js` 574줄 본인 작성 (28/30 커밋) | A | `ref/20_evidence.md` A행 |
| 문제 | Firestore 는 부분 일치 검색 미지원 → 한글 검색 시 풀 스캔. 범위 쿼리 제약으로 "기간 내 빈 방이 있는 호텔"을 한 번에 못 찾음 | A | `ref/projects/pookjayo.md` §핵심 구현 3 |
| 토큰화 | 호텔명 · 주소를 **1~3그램**으로 토큰화 (`generateNgrams`, 슬라이딩 윈도우 substring) | A | `ref/20_evidence.md` A행 |
| 저장 | 배열이 아닌 **객체 키 매핑**(`{ngram: true}`) → 컬렉션 풀 스캔 없이 토큰 키를 직접 참조 | B | `ref/20_evidence.md` B등급 표 |
| 스코어링 | 매칭된 ngram 중 최대 길이를 점수로, 동점 시 제목순 정렬 | A | `searchQuery.js:363` → A행 |
| 날짜 인덱스 | 날짜를 일 단위로 펼친 `availability` 인덱스를 설계하고, **쓰기 경로(결제)가 이 인덱스를 함께 갱신하도록 맞춤** | A | `ref/20_evidence.md` A행 |
| 금지 표현 | "자모 분리"(D24) · "Trie"(D25) · "O(1)"(D27) · "검색 95% 단축"(D7) | — | `ref/20_evidence.md` |

### 4.5 2단 캐시

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| 구조 | 메모리 → IndexedDB → 네트워크. TTL 기본 300초. IndexedDB 승격 포함 | A | `ref/20_evidence.md` A행 (단독 작성 1/1) |
| 형태 | `createCacheUtil(storeName, {cacheExpiration, dbName, dbVersion})` 팩토리로 스토어별 재사용 · TTL 주입 | A | `ref/projects/pookjayo.md` §핵심 구현 4 (코드 인용) |
| 이유 | Firestore 읽기는 과금 대상이고 호텔 목록은 자주 바뀌지 않음 | A | 같은 절 |

### 4.6 그 외

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| 데이터 수집 | Python (BS4 + Selenium) 으로 전국 9개 지역 × 100 = **900개** 숙소 | A | `ref/20_evidence.md` A행 |
| 문서화 | README 에 mermaid 다이어그램 10여 개 (데이터 흐름 · 검색 시퀀스 · FSM · 결제 시퀀스 · 스키마) | A | `ref/20_evidence.md` A행 |
| 격리 검증 | `src/pages/@test/` — Storybook 없이 컴포넌트 · 기능을 격리 확인하는 라우트를 직접 만듦 (`@` 접두사로 서비스 라우트와 구분) | A | `ref/projects/pookjayo.md` §핵심 구현 6 |

### 4.7 과장 금지

| 사실 | 출처 |
|---|---|
| **자동화 테스트 코드는 없다.** `@test` 는 수동 확인용 페이지다. | `ref/projects/pookjayo.md` §과장하면 안 되는 것 |
| 274커밋 중 40건이 머지 커밋 (실제 작업 커밋 234). | 같은 절 |
| Cloud Functions 를 "백엔드 개발"로 쓰지 않는다 → "서버리스 함수로 결제 로직 구현". | 같은 절 |
| 로그인 · 회원가입 · 다크모드 · 토스트 · 인풋 검증은 팀원 담당. | 같은 절 |
| React 19 / Tailwind v4 는 최신 버전 추종 성격이고 깊이의 근거로 약하다. | 같은 절 |

---

## 5. 2군 (한 줄씩)

| 프로젝트 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| neutropic | 2026-06-22~26 · 2인 · **팀장 겸 프론트엔드 전담** (Vue 3). 설문 단계 이동 · 입력 검증을 순수 함수로 분리해 테스트하고, 비일관적인 API 오류를 사용자용 메시지로 변환. RAG 검색 쿼리 생성 · 데이터 정제 · 의료 안전성 가드레일 보강에 참여 | A | `ref/20_evidence.md` A행 · `ref/projects/neutropic.md` |
| videOn | 2025.01 · 5인 · Web Components 로 컴포넌트 시스템 직접 구현 | B | `DESIGN.md` §2 2군 · `ref/projects/est-bootcamp.md` |
| morgorithm | 2026.03 · 6인 · 알고리즘 스터디 직접 설계 · 운영 (전원 승인 필수 브랜치 보호). 팀장 카운트에만 포함 | B | `DESIGN.md` §2 2군 · `ref/projects/morgorithm.md` |

`DESIGN.md` §2 §뺀 것: `outliner` · `own_outliner` · `my_memo_flutter` · ZMK/QMK ·
우테코 프리코스 · Croop 상세 · Smart Farm 상세 · 알고리즘 커밋 수 — **사이트에 넣지 않는다.**

---

## 6. 기술 (숙련도 등급 포함, D 제외)

`ref/03_skills.md` 의 등급 정의: A 능숙(직접 설계 · 구현, 코드로 설명 가능) /
B 사용 경험(부분적) / C 학습 중. **D 는 전부 제외했다.**

| 영역 | A (능숙) | B (사용 경험) | C (학습 중) |
|---|---|---|---|
| Core | JavaScript(ES6+) · TypeScript · React 19 · Next.js 15 App Router · HTML5/CSS3 | — | — |
| 상태 · 데이터 | Zustand · TanStack Query | Context API · Axios | — |
| 스타일 · UI | Tailwind CSS v4 · 반응형/모바일 우선 | Radix · shadcn/ui | Sass |
| 폼 · 검증 · 테스트 | Zod · Jest + RTL | React Hook Form · MSW | — |
| 서버 · 데이터 | Firebase Functions · Firestore 모델링 · IndexedDB | Firebase Auth · Python(BS4/Selenium) | SQL/RDB · Java/Spring Boot · Vue 3/Pinia |
| 협업 · 품질 | Git/GitHub Flow · ESLint/Prettier · Husky/commitlint · PR·이슈 템플릿 · 문서화 | — | — |

출처: `ref/03_skills.md` 전체 표.

⚠️ **제외한 것 (근거 없음 = D)**: Redux/RTK · Styled-Components · Storybook ·
TanStack Form · Biome(FF 기준) · WebSocket/STOMP/SockJS · SSE/EventSource ·
Firebase Realtime. 특히 실시간 통신 3종은 기술 스택 나열에서도 뺀다
(`ref/03_skills.md` §실시간 통신).

⚠️ **표기 충돌 (미해결)**: `ref/03_skills.md` 는 실시간 통신을 D 로 매겼으나(FestiFriends
기준), YORR 에서는 재접속 복구 · heartbeat · 스냅샷 병합을 본인이 설계 · 구현했다
(`DESIGN.md` §8 미결 항목). **소유자 판단이 나올 때까지 사이트에서는 기술명으로 쓰지 않고,
YORR 항목 안의 구현 사실(커밋 근거 있음)로만 표현한다.**

---

## 7. 교육 · 자격

| 항목 | 값 | 등급 | 출처 |
|---|---|:-:|---|
| 학력 | 인하대학교 화학과 졸업 (2024.08) | A | `ref/01_profile.md` §학력 (학점은 PII 로 제외) |
| SSAFY 15기 비전공자 트랙 | 삼성청년SW아카데미 · 2026.01 ~ 재학 | A | `ref/01_profile.md` §교육 이수 |
| 코드잇 스프린트 FE 단기 심화 | 2025.04 ~ 2025.07 수료 | A | 같은 절 |
| 이스트캠프 오르미 FE 4기 | 2024.11 ~ 2025.04 수료 | A | 같은 절 |
| SW 역량테스트 A+ | SSAFY · 2026 | A | `ref/20_evidence.md` A행 |
| OPIc IH | 2023.10 취득, **현재 만료** | A | `ref/20_evidence.md` A행 |
| 알고리즘 스터디 운영 | SSAFY 1건 (팀장). 4명 중 3명 SW 역량테스트 A형, 본인 A+ | A/B | `ref/01_profile.md` §대외 활동 (타인 결과는 B) |

- KEB SW 전문인재양성(2023)은 노출하지 않는다 (`DESIGN.md` §8 결정: 학력 1 + 과정 3개만).
- Velog 공개 글 수(125개)는 **썩는 수치**이므로 사이트에 숫자로 쓰지 않는다 (`DESIGN.md` §6).
- "전원 백준 골드"는 등급 C·D 이므로 금지 (`ref/20_evidence.md` D29).

---

## 8. 링크 · 자산

| 항목 | URL | 상태 |
|---|---|---|
| GitHub | https://github.com/jadewisemann | 사용 |
| Velog | https://velog.io/@jadewisemann | 사용 |
| 이메일 | jadewisemann@gmail.com | 사용 (의도적 공개) |
| YORR 코드 | https://github.com/jadewisemann/yorr | 사용 (미러) |
| FestiFriends 데모 | https://ff-frontend-rust.vercel.app/ | 사용 |
| FestiFriends 코드 | https://github.com/FestiFriends/ff_frontend | 사용 |
| Pookjayo 데모 | https://pookjayo.vercel.app/ | 사용 |
| Pookjayo 코드 | https://github.com/jadewisemann/Pookjayo | 사용 |
| 무한 렌더링 수정 커밋 | https://github.com/FestiFriends/ff_frontend/commit/786efc5285bf72f1ac980659a3c269cb7e75f71d | 사용 |
| `s15-Yorr` 조직 | — | **금지** (2026-08-31 확인 시 404) |
| 개인 포크 `ff_frontend__jade` | — | **금지** (커밋 중복 집계) |

### 확보되지 않은 것 (사실 없음 — 지어내지 않는다)

| 항목 | 상태 | 출처 |
|---|---|---|
| YORR 배포 데모 URL | 미확보. `ref` 에는 "Vercel(FE) 배포"만 있고 URL 이 없다 | `ref/projects/yorr.md` 개요표 |
| 이력서 파일 링크 | 미확보 | `DESIGN.md` §8 |
| 스크린샷 자산 | `neutropic/docs/screenshots/` 11장이 유일 (이 저장소에 복사되지 않음) | `DESIGN.md` §3 |
| 프로젝트 이미지 · 영상 | 없음. **이미지 없는 시각 전략이 필요하다** (아트 디렉션 입력) | — |

---

## 9. 금지 목록 (빌드 산출물에서 기계 검사 대상)

`ref/README.md` ⛔ 절과 `ref/20_evidence.md` D 표에서 사이트에 적용되는 것:

1. "실시간 채팅 시스템을 구축했다" (D1)
2. "SSE 알림 시스템을 구현했다" (D2)
3. "백엔드 경험" (D3 계열 · `ff_backend` 커밋 0)
4. "오픈소스 기여" (병합 0건)
5. 근거 없는 정량 수치 — 연결 끊김 0%, 알림 도달률 100%, 무결성 100%, 검색 95% 단축
   (2초→100ms), 스크롤 성능 90% 향상, 타입 에러 0건, 부작용 0%, Lighthouse 90점,
   120ms→18ms, 인지 속도 40% 개선, 연동 에러 0건, 총 커밋 500+ (D3~D14, D20)
6. "마감 16시간 전 치명적 오류 해결" (D28)
7. "메시지 병합 큐" (D15) · "오디오 버퍼 메모리 누수" (D16) · "지수 백오프 충돌" (D17) ·
   "멱등성 키 검증 프로세스" (D18) · "MSW 지연 에뮬레이션" (D19) ·
   "행정안전부 시큐어 코딩 가이드" (D21)
8. FSM 상태명 `PENDING / CONFIRMED / FAILED` (D23 — 실제 상태명만)
9. "한글 자모 분리" (D24) · "Trie" (D25) · "O(1)" (D27)
10. "Security Rules 로 정교한 접근 제어" (D26)
11. "전원 백준 골드" (D29)
12. "CI 가 강제한다" (`DESIGN.md` §5 · `ref/projects/yorr.md` §4.2)

추가로 이 저장소 고유 금지: 팀원 실명 · PII 6종 · 소속 기관 내부 용어 · 커밋 총수 자랑.
