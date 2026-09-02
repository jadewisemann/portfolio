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

/**
 * 밴드당 각 샷을 몇 번 반복하는가. 결함 실측: 밴드당 4장(샷 그대로)으로는 근접 거리에서
 * 채널 폭이 시야보다 넓어지는 구간(작은 dz)마다 화면에 남는 평면이 사라진다 — 채널
 * 불변식이 모든 평면을 중심선에서 최소 `CHANNEL_HALF` 만큼 밀어내는데, 그 밀어낸 만큼의
 * 수평 시야를 확보하려면 카메라와 평면 사이 거리(dz)가 일정 문턱을 넘어야 하고, 4장을
 * 밴드 전체(`DEPTH_PER_PROJECT`)에 성기게 펼치면 그 문턱을 넘는 평면이 한 번에 1~2장뿐인
 * 구간이 생긴다(진행률 100% 실측: 1장).
 *
 * `shots.ts` 가 정한 4장(프로젝트당)은 늘리지 않는다 — 그것은 owner 의 몫이다. 대신
 * 같은 4장을 밴드 안에서 두 번씩 배치한다. 같은 샷의 두 사본은 항상 같은 쪽 벽(`side`)에
 * 앉고, 가까운 사본이 크게 · 먼 사본이 작게 보인다 — 우연한 중복이 아니라 "같은 액자가
 * 복도 한쪽 벽을 따라 다시 걸려 있다"는 저작된 리듬으로 읽히게 하기 위해서다.
 *
 * (실측: 두 사본은 한 번 화면에 들어오면(문턱 dz 를 넘으면) 상당한 구간 동안 **함께**
 * 보인다 — 가까운 큰 사본과 먼 작은 사본이 동시에 화면에 있는 프레임이 드물지 않다.
 * 처음에는 "겹쳐 보이는 프레임이 없어야 우연한 중복처럼 안 보인다"고 가정했지만 실측은
 * 반대였다: 두 사본이 같은 프레임에 함께, 크기만 다르게 보이는 것이 오히려 "같은 액자가
 * 원근으로 두 번 반복된다"는 신호를 더 분명하게 준다 — 한 번에 하나씩만 보였다면 반복
 * 자체를 알아챌 수 없었을 것이다. 지금은 자리표시자뿐이라 실제 사진이 들어와야 최종
 * 판정이 가능하다).
 */
const REPEATS_PER_SHOT = 2;

/** 밴드 앞뒤 여백 — 4장 배치일 때 실측한 값(`bandTop - 0.6 .. bandTop - 5.1`)을 그대로 쓴다. */
const BAND_MARGIN = 0.6;

export function corridorItems(
  projects: readonly ShowcaseProject[] = PROJECTS,
): readonly CorridorItem[] {
  const items: CorridorItem[] = [];

  projects.forEach((project, projectIndex) => {
    const bandTop = -projectIndex * DEPTH_PER_PROJECT;
    const slotCount = project.shots.length * REPEATS_PER_SHOT;
    const step = (DEPTH_PER_PROJECT - 2 * BAND_MARGIN) / (slotCount - 1);

    for (let repeatIndex = 0; repeatIndex < REPEATS_PER_SHOT; repeatIndex += 1) {
      project.shots.forEach((shot, shotIndex) => {
        // 반복 회차(repeatIndex)를 바깥 루프로 두어 한 회차의 4장이 밴드 앞쪽에,
        // 다음 회차의 4장이 밴드 뒤쪽에 온다 — "같은 4장이 두 번 지나간다"는 구조가
        // z 좌표에서 그대로 읽힌다.
        const slot = repeatIndex * project.shots.length + shotIndex;
        const seed = projectIndex * 97 + shotIndex * 11 + repeatIndex * 53;
        const { width, height } = sizeFor(shot);
        const halfWidth = width / 2;
        const side = shotIndex % 2 === 0 ? -1 : 1;
        const extra = 0.15 + Math.abs(noise(seed)) * 0.35;
        const x = side * (CHANNEL_HALF + halfWidth + extra);
        const y = noise(seed + 1) * 0.45;
        const z = bandTop - BAND_MARGIN - slot * step;
        const rotZ = noise(seed + 2) * 0.05;
        const rotY = noise(seed + 3) * 0.1;

        items.push({
          key: `${project.id}-${shotIndex}-${repeatIndex}`,
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
    }
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
export const CORRIDOR_LOOKAHEAD = 3.5;

export function corridorIndexForZ(z: number, projectCount: number): number {
  const index = Math.floor(-(z - CORRIDOR_LOOKAHEAD) / DEPTH_PER_PROJECT);
  return Math.min(projectCount - 1, Math.max(0, index));
}

const TARGET_DEPTH_FRACTION = 0.17;

export function corridorProjectTargetZ(projectIndex: number): number {
  return (
    -projectIndex * DEPTH_PER_PROJECT -
    DEPTH_PER_PROJECT * TARGET_DEPTH_FRACTION +
    CORRIDOR_CAMERA_START_Z / 4
  );
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

/* ==========================================================================
   점프 이징 — 프로젝트로 이동 버튼이 스크롤을 2,430px 순간이동시키던 결함.
   스크롤 이송 자체는 계속 가로채지 않는다(`window.scrollTo` 는 즉시 실행,
   MOTION_LANGUAGE.md §5.3) — 대신 **카메라가 화면에 그리는 위치**를 옮긴다.
   카메라 변환은 씬의 좌표계에 속하고 DOM 속성이 아니므로 `MOTION_LANGUAGE.md`
   §8 의 DOM 속성 목록 제한을 받지 않는다 — 3D 씬 안의 명시적 변환이다(§1.4·§6).

   실측 결함(비평 4): `--ease-spine`(expo-out, 평균 초기 속도 6.25배)을 12.8
   유닛 돌리에 그대로 썼더니 126ms 만에 거리의 55% 를 이동하고 마지막 258ms 는
   0.02 유닛만 움직였다 — 순간이동 + 잔류 드리프트였지 이동이 아니었다.
   `--ease-travel`("다른 자리로 이동할 때", MOTION_LANGUAGE.md §3)로 바꾸고,
   그 더 평평한 곡선이 큰 거리에서도 이동으로 읽히도록 지속 시간을 장면 간
   대역 상한(§4, 420~900ms)까지 늘린다. 900ms 자체는 이름 붙은 지속 시간
   토큰이 아니다(§4 표는 `--duration-spine` 620ms 까지만 토큰화한다) — 대역의
   서술된 경계값이므로 CSS 커스텀 프로퍼티로 읽을 수 없고, 그래서 여기 리터럴로
   남기며 그 이유를 주석에 적는다(이 문서 자신의 요구: "토큰을 읽을 수 없으면
   이유를 적는다").
   ========================================================================== */

export const CORRIDOR_JUMP_DURATION_MS = 900;

const bezierCache = new Map<string, readonly [number, number, number, number]>();

/**
 * `globals.css` 의 `cubic-bezier(...)` 커스텀 프로퍼티를 실행 시점에 읽어 네
 * 제어점을 돌려준다 — 예전에는 `--ease-spine` 의 네 숫자를 JS 상수로 손으로
 * 옮겨 적어서(`EASE_SPINE_P1X` 등) `globals.css` 를 바꾸면 이 파일도 같이
 * 바꿔야 하는 두 번째 정본이 생겼다. 이제 `globals.css` 하나만 정본이다.
 *
 * SSR·테스트(jsdom, 이 스타일시트를 로드하지 않는다) 처럼 커스텀 프로퍼티를
 * 읽을 수 없는 환경에서는 문서에 적힌 값과 동일한 폴백으로 물러난다 — 폴백이
 * 실제로 쓰이는 경로다(`layout.test.ts` 가 이 경로를 그대로 탄다).
 */
function readEasingControlPoints(
  cssVar: string,
  fallback: readonly [number, number, number, number],
): readonly [number, number, number, number] {
  const cached = bezierCache.get(cssVar);
  if (cached) return cached;
  let points = fallback;
  if (typeof document !== "undefined" && typeof getComputedStyle === "function") {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    const match = raw.match(
      /cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/,
    );
    if (match) {
      points = [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])];
    }
  }
  bezierCache.set(cssVar, points);
  return points;
}

function bezierComponent(t: number, p1: number, p2: number): number {
  const mt = 1 - t;
  return 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t;
}

/**
 * 진행률(시간, 0~1)을 받아 `--ease-travel`(`cubic-bezier(0.4, 0, 0.2, 1)`,
 * MOTION_LANGUAGE.md §3)로 이징된 진행률을 돌려준다. x(t) 는 이분 탐색으로
 * 뒤집는다 — 프레임당 호출 몇 번뿐이라 비용이 무시할 만하다. 이 곡선은 P1y=0 ·
 * P2y=1 로 t 에 대해 단조 증가라 오버슈트가 없다 — 카메라가 목표를 지나쳤다
 * 되돌아오지 않는다.
 */
export function easeTravel(x: number): number {
  const [p1x, p1y, p2x, p2y] = readEasingControlPoints("--ease-travel", [0.4, 0, 0.2, 1]);
  const clamped = Math.min(1, Math.max(0, x));
  if (clamped === 0 || clamped === 1) return clamped;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    const xAtMid = bezierComponent(mid, p1x, p2x);
    if (xAtMid < clamped) lo = mid;
    else hi = mid;
  }
  return bezierComponent((lo + hi) / 2, p1y, p2y);
}
