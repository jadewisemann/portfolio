import type { Shot, ShowcaseProject } from "../shots";
import { PROJECTS } from "../shots";

/**
 * 랜딩(`/`) 배치 산술. 순수 함수만 둔다 (react·three 를 모른다) — 이전 /f1 의 `layout.ts` 와
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
 *
 * (시도 기록, HeroDiorama 정리 작업: `HeroPoster` 의 프레임에 정적 CSS
 * `rotateY` 를 얹어 이 축까지 맞춰 봤다 — 포스터·씬 픽셀 비교에서 7.63% →
 * 7.58%로, 오차 범위 안의 변화였다. 이 함수가 만드는 2D 위치·크기는 회전을
 * 아예 무시한 근사(축 정렬 사각형)이고, 씬은 회전한 사각형의 네 꼭짓점을 각각
 * 원근 투영한다 — 같은 각도를 나중에 얹어도 두 산술이 근본적으로 다른 값을
 * 낸다. 되돌렸다: 포스터 쪽에서 이 근사를 없애려면 `projectToScreen` 자체를
 * 4-꼭짓점 투영으로 다시 써야 하고, 그건 이 정리 작업의 범위를 넘는다.)
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
/*
  카메라 출발 z. 3.2 에서 1.6 으로 당겼다 — 3.2 에서는 출발 직후 앞에 평면이
  2장뿐이어서 복도가 성기게 시작했다 (`corridorPlanesAhead` 로 실측).
  종점은 총 깊이가 아니라 마지막 프로젝트의 목표 z 다 (`corridorTravel` 참고) —
  카메라가 평면 밭 끝까지 가면 끝으로 갈수록 화면이 성겨지기 때문이다.
*/
export const CORRIDOR_CAMERA_START_Z = 1.6;
export const CORRIDOR_FOV = 62;

/**
 * 카메라가 실제로 지나는 거리.
 *
 * 꼬리를 그냥 잘라내면 **마지막 프로젝트에 스크롤로 도달하지 못한다** — 실제로
 * 그렇게 만들었다가 진행률 100% 가 세 번째가 아니라 두 번째 프로젝트에 머물렀다.
 * 그래서 종점은 임의의 값이 아니라 **마지막 프로젝트의 목표 z** 다. 밭 끝보다
 * 앞에서 멈추므로 앞에 평면이 남고, 동시에 마지막 프로젝트가 화면 중앙에 온다.
 */
export function corridorTravel(
  totalDepth: number,
  projects: readonly ShowcaseProject[] = PROJECTS,
): number {
  const lastTargetZ = corridorProjectTargetZ(projects.length - 1);
  const travel = CORRIDOR_CAMERA_START_Z - lastTargetZ;
  return Math.min(totalDepth, Math.max(DEPTH_PER_PROJECT, travel));
}

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
  return CORRIDOR_CAMERA_START_Z - p * corridorTravel(totalDepth);
}

/**
 * 캡션이 z 하나만 보고 밴드를 나누면 실제로 화면을 채우는 프로젝트보다 뒤처진다
 * — 카메라가 z 에 있어도 그 위치의 평면은 아직 화면 가장자리일 뿐이고, 화면
 * 대부분을 채우는 평면은 그보다 더 앞(더 작은 z)에 있다(`corridorItems` 의
 * `bandTop - 0.6 - shotIndex*step` 배치 때문에 밴드 중심이 아니라 밴드 앞쪽에
 * 몰려 있다).
 *
 * 실측(`corridorDominantProjectIndex` 와 비교, 21 샘플·1440×900 캔버스):
 * 오프셋 없이는 21 샘플 중 8개(38%)가 어긋난다. `DEPTH_PER_PROJECT / 2` 만큼
 * z 를 앞으로 당기면 20/21 이 일치한다(남은 1개는 두 프로젝트가 화면을 거의
 * 반반씩 나눠 갖는 진짜 경계 프레임이다 — 그 프레임엔 "정답"이 없다).
 * `layout.test.ts` 가 이 일치율을 오프셋이 아니라 화면 점유율 기준으로
 * 재검증한다.
 */
export const CORRIDOR_LOOKAHEAD = DEPTH_PER_PROJECT / 2;

export function corridorIndexForZ(z: number, projectCount: number): number {
  const index = Math.floor(-(z - CORRIDOR_LOOKAHEAD) / DEPTH_PER_PROJECT);
  return Math.min(projectCount - 1, Math.max(0, index));
}

export function corridorProjectTargetZ(projectIndex: number): number {
  return -projectIndex * DEPTH_PER_PROJECT - DEPTH_PER_PROJECT / 2 + CORRIDOR_CAMERA_START_Z / 4;
}

export function corridorProgressForZ(z: number, totalDepth: number): number {
  const p = (CORRIDOR_CAMERA_START_Z - z) / corridorTravel(totalDepth);
  return Math.min(1, Math.max(0, p));
}

/**
 * 진행률 `progress` 에서 화면에 잡히는 평면 수.
 *
 * 「끝으로 갈수록 성기다」는 눈으로만 보이는 결함이므로 수로 만들어 테스트한다.
 *
 * 창을 카메라 **앞쪽만**으로 잡았더니 스크린샷과 어긋났다 — 진행률 100% 에서
 * 실제 화면에는 평면이 다섯 장 보이는데 계수는 2였다. 평면은 전부 중심선에서
 * 옆으로 비켜나 있으므로(채널 불변식) 카메라를 막 지난 평면도 화면 가장자리에
 * 남는다. 그래서 창을 카메라 **뒤쪽 `BEHIND` 까지** 넓힌다. 임계값을 낮추는 것이
 * 아니라 계측을 화면에 맞추는 것이다.
 */
const VIEW_BEHIND = 2;

/** 다른 e2e 시나리오와 같은 정본 데스크톱 뷰포트(`playwright.config.ts`). */
const CANONICAL_ASPECT = 1440 / 900;

/**
 * `dz` 만큼 앞에 있는 평면이 화면에 걸치는 절반 폭. `projectToScreen` 과 같은
 * 수직 FOV → 수평 FOV 산술이다(`camera.fovDeg` 는 수직).
 */
function corridorFrustumHalfWidth(dz: number, aspect: number): number {
  const halfV = Math.tan((CORRIDOR_FOV * Math.PI) / 180 / 2);
  return dz * halfV * aspect;
}

/**
 * z 창 안에 있어도 카메라 시야 **밖**(좌우)에 있으면 화면에 없다.
 *
 * 실측 결함(`layout.test.ts`): 진행률 1.0 에서 `pookjayo-2` 는 x = -1.8 인데
 * 그 깊이의 시야 반폭은 그보다 좁다 — z 창만 보는 이전 `corridorPlanesInView`
 * 는 이 평면을 화면에 있다고 셌다.
 */
function corridorItemOnScreen(
  item: CorridorItem,
  cameraZ: number,
  aspect: number,
): boolean {
  const dz = cameraZ - item.z;
  if (dz <= 0.01) return false;
  const halfWidth = corridorFrustumHalfWidth(dz, aspect);
  const nearEdge = Math.abs(item.x) - item.width / 2;
  return nearEdge < halfWidth;
}

/**
 * 화면에 걸치는 넓이(뷰포트를 100×100 좌표로 두고 클리핑한 사각형 넓이). 절대
 * 픽셀이 아니라 프로젝트 사이의 **상대** 점유율을 비교하기 위한 값이다 —
 * `corridorDominantProjectIndex` 가 이 합을 프로젝트별로 더해 비교한다.
 */
function corridorItemScreenArea(
  item: CorridorItem,
  cameraZ: number,
  aspect: number,
): number {
  const rect = projectToScreen(item, {
    x: 0,
    y: 0,
    z: cameraZ,
    fovDeg: CORRIDOR_FOV,
    aspect,
  });
  if (!rect) return 0;
  const left = rect.leftPct - rect.widthPct / 2;
  const right = rect.leftPct + rect.widthPct / 2;
  const top = rect.topPct - rect.heightPct / 2;
  const bottom = rect.topPct + rect.heightPct / 2;
  const visibleWidth = Math.max(0, Math.min(right, 100) - Math.max(left, 0));
  const visibleHeight = Math.max(0, Math.min(bottom, 100) - Math.max(top, 0));
  return visibleWidth * visibleHeight;
}

/**
 * 진행률이 아니라 **화면 점유율**로 "지금 어느 프로젝트인가"를 구한다.
 * `corridorIndexForZ` 가 밴드 산술로 값싸게 근사하는 값의 정답 — 이 함수와
 * 어긋나면 캡션이 화면에 없는 프로젝트 이름을 읽는 것이다(`layout.test.ts`).
 */
export function corridorDominantProjectIndex(
  cameraZ: number,
  aspect: number = CANONICAL_ASPECT,
  projects: readonly ShowcaseProject[] = PROJECTS,
): number {
  const areas = new Array(projects.length).fill(0) as number[];
  for (const item of corridorItems(projects)) {
    areas[item.projectIndex] += corridorItemScreenArea(item, cameraZ, aspect);
  }
  let best = 0;
  for (let i = 1; i < areas.length; i += 1) {
    if (areas[i] > areas[best]) best = i;
  }
  return best;
}

export function corridorPlanesInView(
  progress: number,
  depth = DEPTH_PER_PROJECT,
  projects: readonly ShowcaseProject[] = PROJECTS,
  aspect: number = CANONICAL_ASPECT,
): number {
  const cameraZ = corridorCameraZ(progress, corridorTotalDepth(projects));
  return corridorItems(projects).filter(
    (item) =>
      item.z < cameraZ + VIEW_BEHIND &&
      item.z > cameraZ - depth &&
      corridorItemOnScreen(item, cameraZ, aspect),
  ).length;
}
