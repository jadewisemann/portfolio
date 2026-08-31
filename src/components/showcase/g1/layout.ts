import type { Shot, ShowcaseProject } from "../shots";
import { PROJECTS } from "../shots";

/**
 * /g1 배치 산술. 순수 함수만 둔다 (react·three 를 모른다) — /f1 의 `layout.ts` 와
 * 같은 이유다: 자리(레이아웃)와 렌더를 분리하면 값을 눈으로 검증하기 쉽고, 정적
 * 포스터와 라이브 씬이 같은 숫자에서 갈라지지 않는다.
 *
 * 이 파일이 유일한 정본이다. `HeroPoster`(DOM) 와 `HeroScene`(R3F) 는 둘 다
 * 여기서 만든 `HERO_ITEMS` 를 읽는다 — 좌표를 CSS 로 손으로 옮겨 적지 않는다
 * (owner 지시: "화면을 CSS 로 손으로 베끼지 않는다").
 */

export type ItemKind = "desktop" | "mobile";

export interface Item {
  readonly key: string;
  readonly shot: Shot;
  /** world 좌표. 카메라는 항상 원점에서 -z 를 바라본다. */
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly rotY: number;
  readonly rotZ: number;
  readonly width: number;
  readonly height: number;
}

export interface Camera {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly fovDeg: number;
  readonly aspect: number;
}

const MOBILE_HEIGHT = 2.4;
const DESKTOP_WIDTH = 3.2;

function sizeFor(shot: Shot): { width: number; height: number } {
  if (shot.kind === "mobile") {
    const height = MOBILE_HEIGHT;
    return { width: height * (shot.width / shot.height), height };
  }
  const width = DESKTOP_WIDTH;
  return { width, height: width * (shot.height / shot.width) };
}

/**
 * 데스크톱 · 태블릿(≥768px) 히어로. 6장 — 프로젝트마다 두 장, 종류를 섞는다.
 * 가운데 띠(|x| < 0.9 대략)를 비워 이름이 앉을 자리를 낸다. 손으로 고른 좌표다 —
 * 항목이 6개뿐이라 노이즈 함수보다 눈으로 맞추는 편이 더 정확하다(참고:
 * `review/showcase/scroll-f1-1920-35.png`, 유일하게 "진짜 공간감"이 나온 프레임).
 */
export function heroItemsDesktop(): readonly Item[] {
  const pick = (
    projectIndex: number,
    shotIndex: number,
    x: number,
    y: number,
    z: number,
    rotZDeg: number,
    rotYDeg: number,
  ): Item => {
    const project = PROJECTS[projectIndex];
    const shot = project.shots[shotIndex];
    const { width, height } = sizeFor(shot);
    return {
      key: `${project.id}-${shotIndex}`,
      shot,
      x,
      y,
      z,
      rotZ: (rotZDeg * Math.PI) / 180,
      rotY: (rotYDeg * Math.PI) / 180,
      width,
      height,
    };
  };

  return [
    pick(0, 0, -2.05, -0.32, -2.0, -4, 6),
    pick(0, 3, 1.95, 0.55, -3.5, 2, -8),
    pick(1, 0, -1.65, 0.62, -4.3, -2, 7),
    pick(1, 2, 2.35, -0.48, -1.65, 5, -6),
    pick(2, 0, -2.7, 0.12, -3.05, 3, 5),
    pick(2, 3, 0.95, -0.82, -4.9, -3, -5),
  ];
}

/**
 * 320px 히어로. 데스크톱을 줄인 것이 아니라 세로 화면비에 맞춘 별도 구성이다
 * (owner 조건: "320 은 다른 구성이어야 한다"). 항목 4개, 세로로 얕게 쌓는다.
 */
/**
 * 세로 화면비(aspect ≈ 0.52)에서 가로 시야가 아주 좁다 — 데스크톱과 같은
 * world 크기를 쓰면 가장 가까운 평면 하나가 화면 전체를 덮는다(실측: 320px
 * 첫 렌더에서 프레임 하나가 뷰포트의 108% 폭을 차지해 이름을 거의 다 가렸다).
 * 그래서 히어로 모바일 항목은 자체 축소 크기(`MOBILE_HERO_HEIGHT`)를 쓴다.
 */
const MOBILE_HERO_HEIGHT = 0.95;

export function heroItemsMobile(): readonly Item[] {
  const pick = (
    projectIndex: number,
    shotIndex: number,
    x: number,
    y: number,
    z: number,
    rotZDeg: number,
  ): Item => {
    const project = PROJECTS[projectIndex];
    const shot = project.shots[shotIndex];
    const height = MOBILE_HERO_HEIGHT;
    const width = height * (shot.width / shot.height);
    return {
      key: `${project.id}-${shotIndex}`,
      shot,
      x,
      y,
      z,
      rotZ: (rotZDeg * Math.PI) / 180,
      rotY: 0,
      width,
      height,
    };
  };

  // 이름이 앉을 세로 중앙 띠(|y| ≲ 0.35)를 비우고, 위 둘 · 아래 둘로 얕게
  // 계단을 놓는다 — 세로로 receding 되는 카드 캐스케이드.
  return [
    pick(0, 0, -0.22, 0.62, -1.8, -3),
    pick(1, 2, 0.24, 0.55, -2.6, 4),
    pick(2, 0, -0.2, -0.6, -3.4, -4),
    pick(0, 2, 0.22, -0.98, -4.2, 3),
  ];
}

export const HERO_CAMERA_DESKTOP: Camera = {
  x: 0,
  y: 0,
  z: 0,
  fovDeg: 50,
  aspect: 1.7,
};

export const HERO_CAMERA_MOBILE: Camera = {
  x: 0,
  y: 0,
  z: 0,
  fovDeg: 50,
  aspect: 0.52,
};

export interface ScreenRect {
  readonly leftPct: number;
  readonly topPct: number;
  readonly widthPct: number;
  readonly heightPct: number;
  readonly rotateDeg: number;
  readonly zIndex: number;
}

/**
 * `item` 을 `camera` 로 본 2D 화면 좌표로 투영한다. 포스터(DOM) 전용 — 실제 씬은
 * three.js 가 이 계산을 직접 한다. 같은 `item` 배열에서 계산하므로 두 렌더러가
 * 다른 숫자를 볼 수 없다. rotY(3D 기울기)는 2D 포스터에서 표현하지 않는다 —
 * `rotateDeg` 는 화면 평면 회전(rotZ)만 옮긴다. 근사이지 재해석이 아니다: 위치 ·
 * 크기 · 앞뒤 순서는 정확히 같은 산술에서 나온다.
 */
export function projectToScreen(item: Item, camera: Camera): ScreenRect | null {
  const dz = camera.z - item.z;
  if (dz <= 0.01) return null;
  const halfV = Math.tan((camera.fovDeg * Math.PI) / 180 / 2);
  const halfH = halfV * camera.aspect;
  const ndcX = (item.x - camera.x) / (dz * halfH);
  const ndcY = (item.y - camera.y) / (dz * halfV);
  return {
    leftPct: ((ndcX + 1) / 2) * 100,
    topPct: ((1 - ndcY) / 2) * 100,
    widthPct: (item.width / (dz * halfH * 2)) * 100,
    heightPct: (item.height / (dz * halfV * 2)) * 100,
    rotateDeg: (item.rotZ * 180) / Math.PI,
    zIndex: Math.round(1000 - dz * 10),
  };
}

/* ==========================================================================
   복도(corridor) — 프로젝트 3개를 지나는 스크롤 갤러리. /f1 의 카메라가 평면
   자체에 들어가 화면 전체가 자리표시자 채움색으로 덮이는 결함(실측:
   `review/showcase/scroll-f1-1920-55.png`)을 다시 만들지 않기 위해 산술을
   바꾼다 — 카메라 경로가 아니라 **평면의 자리**를 고친다.

   규칙 하나: 모든 평면의 중심은 |x| >= CHANNEL_HALF + 평면 반폭 을 만족한다.
   카메라는 x=0·y=0 에 고정한 채 z 만 스크롤을 따라 움직인다. 두 조건을 같이
   두면 카메라 시선(x=0 을 지나는 직선)이 어떤 z 에서도 어떤 평면의 사각형과
   교차하지 않는다 — "카메라가 평면 안으로 들어간다"는 결함 자체가 산술적으로
   성립할 수 없다. 회피(회전 카메라 경로)가 아니라 배치 불변식으로 막는다.
   ========================================================================== */

export const CHANNEL_HALF = 0.75;
export const DEPTH_PER_PROJECT = 6;
export const CORRIDOR_CAMERA_START_Z = 3.2;
export const CORRIDOR_FOV = 62;

export interface CorridorItem extends Item {
  readonly projectIndex: number;
}

/** 결정론적 의사난수 — Math.random 은 리렌더마다 배치가 흔들린다. */
function noise(seed: number): number {
  const n = Math.sin(seed * 12.9898) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

export function corridorItems(
  projects: readonly ShowcaseProject[] = PROJECTS,
): readonly CorridorItem[] {
  const items: CorridorItem[] = [];

  projects.forEach((project, projectIndex) => {
    const bandTop = -projectIndex * DEPTH_PER_PROJECT;
    const step = DEPTH_PER_PROJECT / project.shots.length;

    project.shots.forEach((shot, shotIndex) => {
      const seed = projectIndex * 97 + shotIndex * 11;
      const { width, height } = sizeFor(shot);
      const halfWidth = width / 2;
      const side = shotIndex % 2 === 0 ? -1 : 1;
      const extra = 0.15 + Math.abs(noise(seed)) * 0.35;
      const x = side * (CHANNEL_HALF + halfWidth + extra);
      const y = noise(seed + 1) * 0.45;
      const z = bandTop - 0.6 - shotIndex * step;
      const rotZ = noise(seed + 2) * 0.05;
      const rotY = noise(seed + 3) * 0.1;

      items.push({
        key: `${project.id}-${shotIndex}`,
        shot,
        x,
        y,
        z,
        rotY,
        rotZ,
        width,
        height,
        projectIndex,
      });
    });
  });

  return items;
}

export function corridorTotalDepth(
  projects: readonly ShowcaseProject[] = PROJECTS,
): number {
  return projects.length * DEPTH_PER_PROJECT;
}

/** 스크롤 진행률 [0,1] 에서 카메라 z. 경로는 항상 x=0·y=0 직선이다. */
export function corridorCameraZ(
  progress: number,
  totalDepth: number,
): number {
  const p = Math.min(1, Math.max(0, progress));
  return CORRIDOR_CAMERA_START_Z - p * totalDepth;
}

export function corridorIndexForZ(z: number, projectCount: number): number {
  const index = Math.floor(-z / DEPTH_PER_PROJECT);
  return Math.min(projectCount - 1, Math.max(0, index));
}

export function corridorProjectTargetZ(projectIndex: number): number {
  return -projectIndex * DEPTH_PER_PROJECT - DEPTH_PER_PROJECT / 2 + CORRIDOR_CAMERA_START_Z / 4;
}

export function corridorProgressForZ(z: number, totalDepth: number): number {
  const p = (CORRIDOR_CAMERA_START_Z - z) / totalDepth;
  return Math.min(1, Math.max(0, p));
}
