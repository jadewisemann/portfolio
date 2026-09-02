/**
 * 스크린샷 정본 — 세 프로토타입(/f1 /f2 /f3)이 전부 여기서 읽는다.
 *
 * 실제 스크린샷은 아직 없다. 각 항목의 `src` 를 빈 문자열로 둔다 — 자리표시자다
 * (owner 지시: "obviously placeholders", CONTENT.md §8 "프로젝트 이미지 · 영상 없음").
 * 실제 이미지가 오면 이 파일에서 **그 한 줄의 `src` 만** 채우면 된다. 렌더링 쪽
 * (PlaceholderFrame · texture.ts) 은 `src` 유무만으로 자리표시자와 실사진을 가른다.
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
    shots: [
      mobileShot("YORR 모바일 화면 자리표시자, 로비"),
      mobileShot("YORR 모바일 화면 자리표시자, 게임판"),
      mobileShot("YORR 모바일 화면 자리표시자, 결과"),
      desktopShot("YORR 데스크톱 화면 자리표시자"),
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
    shots: [
      desktopShot("FestiFriends 데스크톱 화면 자리표시자, 공연 목록"),
      desktopShot("FestiFriends 데스크톱 화면 자리표시자, 모임 개설"),
      mobileShot("FestiFriends 모바일 화면 자리표시자, 찜 목록"),
      mobileShot("FestiFriends 모바일 화면 자리표시자, 상세"),
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
    shots: [
      mobileShot("Pookjayo 모바일 화면 자리표시자, 검색"),
      mobileShot("Pookjayo 모바일 화면 자리표시자, 숙소 상세"),
      mobileShot("Pookjayo 모바일 화면 자리표시자, 결제"),
      desktopShot("Pookjayo 데스크톱 화면 자리표시자"),
    ],
  },
];
