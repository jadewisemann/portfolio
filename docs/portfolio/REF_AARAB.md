# 참조 추출: aarab.me

출처: https://www.aarab.me/ (Aarab Nishchal 개인 포트폴리오)
수집: 2026-09-03, 헤드리스 브라우저 · 계산된 스타일 + DOM 구조
성격: **참조 자료**입니다. 승인된 아트 디렉션이 아닙니다. ART_DIRECTION.md 는 별도로 결정됩니다.

## 1. 색

다크 단일 모드입니다. 라이트 대응이 없습니다.

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--background` | `#050507` | 지면. 순검정이 아닌 청색 편향 |
| `--card` | `#09090c` | 카드 기본 |
| `--card-hover` | `#101016` | 카드 호버 |
| `--muted` | `#0d0d12` | 하위 면 |
| `--popover` / `--sidebar` | `#07070b` | 오버레이 |
| `--foreground` | `#f1f2f3` | 본문 |
| `--muted-foreground` | `#98a4b3` | 보조. 청회색 |
| `--border` | `#181825` | 괘선 |
| `--card-border-hover` | `#2d2d43` | 호버 괘선 |
| `--accent` / `--ring` | `#5fd2f2` | 시안. 유일한 강조 |
| `--secondary` | `#e12afb` | 마젠타. 실사용 거의 없음 |
| `--success` | `#22c378` / bg `#0b412826` | 상태 |
| `--error` | `#e23653` / bg `#430a1326` | 상태 |
| `--radius` | `.75rem` | 기준 반경 |

특징: 지면·카드·팝오버가 `#050507`~`#0d0d12` 사이 4단계로만 갈립니다. 면 구분을 밝기가 아니라 괘선(`#181825`)이 담당합니다.

## 2. 서체

세 가족을 역할로 분리합니다.

- **Instrument Serif** (400) — 디스플레이 전용. 히어로 이름 1회.
- **Geist** — 본문·UI.
- **Geist Mono** — 프로젝트 제목, 태그, 캡션, 번호.
- Nasalization / Bastliga (`--font-heading`) — 섹션 라벨과 대형 숫자.

측정된 조판:

| 역할 | 크기 | 자간 | 행간 | 무게 |
| --- | --- | --- | --- | --- |
| 히어로 H1 (Serif) | 128px | −3.2px | 128px (1.0) | 400 |
| 섹션 라벨 (`ABOUT`) | 24px | **+4.8px** (0.2em) | 32px | 600 |
| 섹션 대형 숫자 | 120→200px | — | 1.0 | 900, italic, `foreground/20` |
| 리드 문장 | 20px | −0.5px | 32.5px | 700 |
| 프로젝트 제목 (Mono) | 16px | +0.8px | 24px | 700, 대문자 |
| 본문 | 16px | +0.8px | 24px (1.5) | 400 |
| 대형 CTA (`let's talk`) | 60px | +1.5px | 60px | 700 |

핵심 대비: **음수 자간의 대형 세리프 ↔ 양수 자간(0.2em)의 소형 대문자 산세리프**. 이 둘 사이에 중간 크기가 거의 없습니다.

## 3. 레이아웃

- 콘텐츠 폭 `max-w-5xl` = **1024px**, 중앙 정렬.
- 좌우 여백 `px-6 / md:px-12 / lg:px-20` = 24 / 48 / 80px.
- 섹션 상하 여백 `py-24 md:py-32` = 96 / 128px. 문서 전체 6626px.
- 히어로는 `min-h-screen`, 이후 섹션은 내용 높이.
- 섹션 헤더는 `sticky top-20`.
- 카드: 반경 `rounded-2xl sm:rounded-3xl` (16→26.4px), 패딩 24→32px, 배경 `neutral-900/30`, 괘선 `neutral-800/60`, `backdrop-blur-md`, 호버 시 괘선 `neutral-700/80` + 배경 불투명화, `transition-all 300ms`.
- 본문 전체를 감싸는 `bg-black/30 backdrop-blur-sm` 층이 고정 배경 위에 얹힙니다.

## 4. 구조

번호가 붙은 6개 섹션입니다. 번호는 초대형 숫자로 배경에 흘립니다.

1. 히어로 — 이름(세리프) + `Contact Me | View Resume` + 우하단 표어
2. `02 ABOUT` — 리드 문장 + 4탭 (BRIEF / EDU / STATS / QUOTE), `03 / 04` 진행 표시
3. `03 SKILLS` — 4줄 마퀴. 줄마다 방향이 다르고 항목이 반복 복제됨
4. `04 EXPERIENCE` — 회사·직함·기간 + 불릿 + 기술 칩
5. `05 WORK` — 프로젝트 카드. `001`~`004` 번호 + LIVE / GITHUB 링크
6. `06 CONTACT` — `let's talk` + `STEP 01 / 04` 폼

## 5. 배경 처리

`position: fixed; inset: 0; z-index: -50` 한 층이 전체 뷰포트를 덮습니다.
시안(`#5fd2f2` 계열)과 검정이 섞인 대형 그라디언트에 **거친 노이즈/그레인**을 입혀, 경계가 디더링된 것처럼 보이게 합니다. 사이트의 유일한 이미지 요소입니다.

## 6. 모션

- 스크롤 리빌이 전 섹션에 걸립니다.
- 마퀴는 무한 루프, 줄마다 속도·방향이 다릅니다.
- 카드 호버 300ms.
- 스크롤 중 섹션 헤더 sticky.
- `prefers-reduced-motion` 대응은 확인하지 못했습니다.

## 7. 이 저장소와 충돌하는 지점

`feat/golden-slice` 의 `src/app/globals.css` 에 이미 반대 방향의 체계가 있습니다.

| 항목 | 현재 저장소 | aarab.me |
| --- | --- | --- |
| 지면 | 라이트 정본 `#faf9f6` | 다크 전용 `#050507` |
| 서체 | IBM Plex 한 가족 (한글 포함) | Geist + Instrument Serif + Nasalization |
| 강조색 | 없음. `signal-built` / `signal-reverted` 두 상태색만 | 시안 `#5fd2f2` |
| 이미지 | 없음. 28px 괘선 기판 | 전면 그레인 그라디언트 |
| 모션 예산 | 이징 2 · 지속시간 3 | 스크롤 리빌 + 마퀴 다수 |
| 대비 | WCAG 상대 휘도로 계산해 주석에 기록 | 미기록 |
| 언어 | 한국어 조판 규칙 (`word-break: keep-all`) | 영문 전용 |
