# jadewisemann — 포트폴리오

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · Motion · Three.js (R3F) ·
Lenis. 배포는 Vercel 이 GitHub 연동으로 처리한다.

## 무엇을 만들고 있나

한 장짜리 사이트 `/` 와 프로젝트 페이지 `/projects/yorr`.

랜딩은 네 절을 세로로 쌓는다 — **main · skills · project · 이력**. 순서의 정본은
`src/content/site.ts` 의 `SECTIONS` 배열 하나이고, 페이지와 상단 내비게이션이 그 배열만
읽는다. 순서를 바꾸는 일은 배열 한 곳을 고치는 일이다.

목표하는 반응은 순서까지 포함해서 이것이다: **"뭐야 이거 예쁘다"** 가 먼저, 그다음
**"엔지니어링을 할 줄 아는구나"**. 아름다움이 먼저 도착한다.

포트폴리오는 프로젝트를 **설명하지 않는다.** 키워드 · 짧은 블러브 · (자산이 오면)
스크린샷을 아름답게 보여주고, 아키텍처와 코드 리딩은 프로젝트 페이지 한 번 클릭
뒤에 둔다.

## 콘텐츠 — 사실을 지어내지 않는다

화면의 모든 사실은 `docs/portfolio/CONTENT.md` 에서 온다. 그 문서에는 항목마다 출처
경로와 근거 등급(A · B)이 붙어 있고, 등급 C · D 는 애초에 들어오지 못한다.
**거기 없는 사실은 화면에도 없다.**

원장의 원본은 형제 저장소 `../_jadewisemann/ref/` 다 (이 저장소 루트 기준 상대 경로).
숫자와 강한 주장은 그 저장소의 `ref/20_evidence.md` 에서 등급 A · B 여야 한다.

`CONTENT.md` 9절의 금지 문구와 PII 는 `src/forbidden-claims.test.ts` 가 기계로 막는다.
**이 게이트는 지우지 않는다** — 이 저장소는 공개이고, 거기 걸리는 문장의 절반은 실제로
이전 이력서에 적혀 있던 것이다.

프로젝트 페이지의 「과장하면 안 되는 것」 · 「본인 관여 없음」 절을 읽고 쓴다. 뺀 것은
조용히 자르지 않고 화면에 함께 적는다 (각 절의 `disclosure`).

## 연출

3D 와 스크롤 연출은 **표현 수단**이지 설명 수단이 아니다. 아키텍처 다이어그램을
움직이게 만드는 데 쓰지 않는다 — 그건 프로젝트 페이지에서 산문과 정적 다이어그램이
할 일이다.

| 무엇 | 누가 |
|---|---|
| 스크롤 이송 (관성 · 감속) | Lenis |
| 스크롤에 묶인 값 (패럴랙스 · 진입 · 스크럽) | Motion (`useScroll` · `useTransform`) |
| 컴포넌트 진입 · 전이 | Motion |
| 호버 · 포커스 · 상태 | CSS |
| 3D 장면 | React Three Fiber |

- 축소 모션(`prefers-reduced-motion: reduce`)에서 **기능은 하나도 사라지지 않는다.**
  사라지는 것은 이동뿐이다. Lenis 를 끄고, 스크럽을 상수로 고정하고, 진입을 최종
  상태로 즉시 렌더한다.
- R3F 캔버스는 히어로가 화면 밖으로 나가면 프레임 루프를 멈춘다.

## 테마와 서체

보는 사람이 오른쪽 위 설정에서 고른다. 선택값의 소재지는 리액트가 아니라 `<html>` 의
데이터 속성이고, 첫 페인트 전에 도는 인라인 스크립트가 `localStorage` 에서 읽어 세운다
(`src/lib/preferences.ts` · `preferences-store.ts`).

**리액트를 값의 주인으로 되돌리지 마라.** 저장된 값이 라이트인 사람이 첫 프레임에
다크를 보고 하이드레이션 뒤에 흰 화면으로 뒤집힌다. `e2e/settings.spec.ts` 가 그
회귀를 막는다.

다크가 정본이고 기본값이다. 팔레트 · 대비 실측값은 `docs/portfolio/DESIGN_SYSTEM.md` §3.

서체는 조합 셋이고 전부 Google Fonts (OFL-1.1) 이지만 `next/font/google` 로 싣지 않는다
— 그 경로에 korean 서브셋을 지원하는 서체가 0종이다. 원본 ttf 를 받아 이 사이트가
실제로 출력하는 글자만 남긴 woff2 를 굽는다:

```bash
npm run fonts:fetch   # 원본 ttf (약 40MB, .gitignore 로 제외)
npm run fonts         # 서브셋 woff2 + OFL 고지
```

## 브라우저가 진실이다

시각 작업을 소스 코드나 보고서로 판정하지 마라. **페이지를 열어서 봐라.**

```bash
npm run dev                                  # localhost:3000
node scripts/capture.mjs review/<이름>        # 프로덕션 빌드로 1920 · 1440 · 320 캡처
```

낡은 스크린샷은 없는 것보다 나쁘다. **판정 직전에 다시 찍는다.**

## 검증

```bash
npm run lint && npm run typecheck && npm test && npm run build && npm run e2e
```

CI(`.github/workflows/ci.yml`)가 PR 마다 같은 것을 돌린다.

## 시각 자료를 찾을 때

직접 구현하기 전에 먼저 본다: React Bits · 21st.dev · Aceternity UI · Magic UI ·
Codrops.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
