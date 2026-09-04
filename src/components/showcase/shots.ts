/**
 * 스크린샷 정본 — 세 프로토타입(/f1 /f2 /f3)이 전부 여기서 읽는다.
 *
 * 스크린샷은 2026-09-04 에 데모를 직접 찍어 채웠다 (`scripts/capture-shots.mjs`,
 * `public/shots/`). `src` 가 비어 있으면 자리표시자다. 렌더링 쪽(PlaceholderFrame)은
 * `src` 유무만으로 자리표시자와 실사진을 가른다.
 *
 * 카운트와 비율은 브리프가 지정한 값 그대로다:
 *   - YORR — 모바일(9:19.5) 3 · 데스크톱(16:10) 1. 휴대폰이 컨트롤러인 게임이므로
 *     모바일이 지배적이다.
 *   - FestiFriends — 데스크톱 2 · 모바일 2.
 *   - Pookjayo — 모바일 3 · 데스크톱 1. 모바일 우선 제품.
 *
 * 문구는 전부 docs/portfolio/CONTENT.md 에서만 가져왔다 (등급 A). 출처는 각 프로젝트
 * 옆에 주석으로 남긴다. `src/forbidden-claims.test.ts` 의 금지 문구를 다시 확인했다.
 */

export type ShotKind = "desktop" | "mobile";

export interface Shot {
  /** 비어 있으면 자리표시자다. 실사진이 오면 이 문자열 하나만 채운다. */
  src: string;
  /**
   * 영상(webm · mp4) 경로. 있으면 **gif 처럼** 그린다 — 소리 없이 자동 반복 재생, 조작
   * 없음 (소유자, 2026-09-04: "주사위는 gif 같은 걸로"). MOTION_LANGUAGE.md 2절의 예외
   * 「프로젝트 매체」다: 콘텐츠이지 UI 가 아니고, 축소 모션에서는 `src`(포스터)만 보인다.
   */
  video?: string;
  width: number;
  height: number;
  kind: ShotKind;
  alt: string;
}

export interface ShowcaseProject {
  id: string;
  name: string;
  blurb: string;
  keywords: readonly string[];
  shots: readonly Shot[];
  /**
   * 프로젝트 페이지 경로. 아키텍처 · 코드 리딩은 랜딩이 아니라 여기서 보여준다
   * (`CLAUDE.md` 「What the owner actually wants」 · `docs/portfolio/SCENE_GRAPH.md` 2절).
   * 아직 페이지가 없는 프로젝트는 이 필드를 비워 둔다 — 없는 곳으로 링크를 만들지 않는다.
   */
  href?: string;
}

/** 9:19.5 — 모바일 세로 화면. */
const MOBILE_W = 360;
const MOBILE_H = 780;

/** 16:10 — 데스크톱 화면. */
const DESKTOP_W = 1280;
const DESKTOP_H = 800;

function mobileShot(alt: string): Shot {
  return { src: "", width: MOBILE_W, height: MOBILE_H, kind: "mobile", alt };
}

function desktopShot(alt: string): Shot {
  return { src: "", width: DESKTOP_W, height: DESKTOP_H, kind: "desktop", alt };
}

export const PROJECTS: readonly ShowcaseProject[] = [
  {
    id: "yorr",
    name: "YORR",
    // CONTENT.md §1 · §2.1 (등급 A)
    blurb:
      "휴대폰을 컨트롤러로 쓰는 모바일 실시간 멀티플레이 게임 플랫폼. 6인 팀에서 프론트엔드를 혼자 맡았다.",
    keywords: [
      "React · Three.js",
      "휴대폰이 컨트롤러가 되는 실시간 멀티플레이",
      "프론트엔드 단독 개발",
      "WebSocket · WebRTC 음성",
    ],
    href: "/projects/yorr",
    /*
      2026-09-04 실측 — 배포는 https://www.yorr.site (소유자 구술). 랜딩(3D 주사위 히어로)은
      capture-shots 로, 게임판은 `/tutorial`(혼자 굴려보기)에서 Playwright 로 직접 굴리며
      찍었다 (`scripts/capture-yorr-game.mjs`). 주사위 굴림은 4.2초 webm 루프 — 소유자가
      "gif 같은 걸로" 라고 했고, 같은 자리에서 훨씬 작다. 축소 모션에서는 포스터만 보인다.
    */
    shots: [
      { ...mobileShot("YORR 모바일 랜딩 — 요트 다이스 아케이드"), src: "/shots/yorr/mobile-landing.png", width: 390, height: 844 },
      { ...mobileShot("YORR 주사위를 굴리는 순간 (반복 재생)"), src: "/shots/yorr/dice-roll-poster.png", video: "/shots/yorr/dice-roll.webm", width: 390, height: 470 },
      { ...mobileShot("YORR 게임판 — 굴리는 중, 킵 레일, 기록 시트"), src: "/shots/yorr/mobile-board.png", width: 390, height: 844 },
      { ...desktopShot("YORR 데스크톱 랜딩 — 아케이드 캐러셀"), src: "/shots/yorr/desktop-landing.png", width: 1440, height: 900 },
    ],
  },
  {
    id: "festifriends",
    name: "FestiFriends",
    // CONTENT.md §3.1 (등급 A). "채팅" 관련 서술은 §3.7(본인 관여 없음)이므로 뺀다.
    blurb:
      "리뷰 기반 신뢰도로 공연 동행을 매칭하는 플랫폼. PM과 프론트엔드를 겸했다.",
    keywords: [
      "Next.js · TanStack Query",
      "headless 컴파운드 컴포넌트",
      "ESLint · Git 훅 단독 세팅",
      "팀 전체가 쓰는 개발 환경",
    ],
    /*
      2026-09-04 실측 (scripts/capture-shots.mjs). 백엔드가 응답하지 않아 목록 · 상세는
      스켈레톤만 남는다 — 그 장들은 넣지 않았다. 랜딩(배너 · 카테고리)과 캘린더는 실제 UI 다.
    */
    shots: [
      { ...desktopShot("FestiFriends 랜딩 — 공연 배너와 카테고리"), src: "/shots/festifriends/desktop-landing.png", width: 1440, height: 900 },
      { ...desktopShot("FestiFriends 캘린더 — 유형 · 지역 필터와 월간 공연 달력"), src: "/shots/festifriends/desktop-calendar.png", width: 1440, height: 900 },
      { ...mobileShot("FestiFriends 모바일 랜딩"), src: "/shots/festifriends/mobile-landing.png", width: 390, height: 844 },
    ],
  },
  {
    id: "pookjayo",
    name: "Pookjayo",
    // CONTENT.md §4.1 · §4.7 (등급 A). "백엔드 개발" 대신 "서버리스 함수 로직"을 쓴다.
    blurb:
      "모바일 우선 숙박 검색 · 예약 · 결제 플랫폼. 팀장 · PM · 서버리스 함수 로직을 맡았다.",
    keywords: [
      "결제 트랜잭션 (Firebase Functions)",
      "메모리 → IndexedDB 2단 캐시",
      "FSM 상태 전이로 중복 요청 차단",
      "N-그램 검색 인덱스",
    ],
    /*
      2026-09-04 실측. 검색 결과 · 상세는 백엔드가 응답하지 않아 스켈레톤만 남는다 — 넣지
      않았다. 랜딩은 스플래시 뒤 실제 UI 가 뜬다. 데스크톱은 모바일 우선 앱이라 가운데
      한 열로 그려지는 그 모습 그대로다.
    */
    shots: [
      { ...mobileShot("Pookjayo 모바일 랜딩 — 숙박 검색 · 날짜 · 인원"), src: "/shots/pookjayo/mobile-landing.png", width: 390, height: 844 },
      { ...desktopShot("Pookjayo 데스크톱 — 모바일 우선 레이아웃"), src: "/shots/pookjayo/desktop-landing.png", width: 1440, height: 900 },
    ],
  },
];
