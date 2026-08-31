import type { ShowcaseProject, Shot } from "../shots";

/**
 * /f1 의 배치 산술. React 나 three 를 모르는 순수 함수로 뺐다 — 자리(레이아웃)와
 * 렌더를 분리하면 값을 눈으로 확인하기 쉽고, 나중에 단위 테스트를 붙이기도 쉽다.
 */

export interface PlacedShot {
  projectId: string;
  projectIndex: number;
  shot: Shot;
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
  width: number;
  height: number;
}

/** 프로젝트 하나가 차지하는 z 깊이 대역. */
export const DEPTH_PER_PROJECT = 9;

const MOBILE_HEIGHT = 2.4;
const DESKTOP_WIDTH = 3.2;

export const CAMERA_START_Z = 3.5;

/** 결정론적 의사난수. Math.random 을 쓰면 리렌더마다 배치가 흔들린다. */
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

export function layoutProjects(
  projects: readonly ShowcaseProject[],
): readonly PlacedShot[] {
  const placed: PlacedShot[] = [];

  projects.forEach((project, projectIndex) => {
    const bandStart = -projectIndex * DEPTH_PER_PROJECT;
    const step = DEPTH_PER_PROJECT / Math.max(1, project.shots.length);

    project.shots.forEach((shot, shotIndex) => {
      const seed = projectIndex * 101 + shotIndex * 7;
      const isMobile = shot.kind === "mobile";
      const height = isMobile
        ? MOBILE_HEIGHT
        : DESKTOP_WIDTH * (shot.height / shot.width);
      const width = isMobile
        ? height * (shot.width / shot.height)
        : DESKTOP_WIDTH;

      // 데스크톱 평면은 폭이 화면 절반을 넘을 만큼 넓다. 카메라 경로(거의 x≈0)
      // 바로 옆에 우연히 놓이면 카메라가 그 평면 안에 들어간 것처럼 화면 전체가
      // 자리표시자의 민무늬 채움색으로 덮여 "빈 화면"처럼 보인다(실측). 그래서
      // 데스크톱 평면의 |x| 에는 하한을 둔다 — 경로에서 최소한 벗어나 있어야
      // 화면 절반은 항상 지면(배경)으로 남는다. 모바일 평면은 폭이 좁아
      // 하한이 필요 없다.
      const jitterX = isMobile ? 1.1 : 0.4;
      const jitterY = isMobile ? 0.35 : 0.12;
      const rawX = noise(seed);
      const x = isMobile
        ? rawX * jitterX
        : Math.sign(rawX || 1) * (0.9 + Math.abs(rawX) * jitterX);
      const y = noise(seed + 1) * jitterY;
      const z = bandStart - shotIndex * step;
      const rotY = noise(seed + 2) * 0.16;
      const rotZ = noise(seed + 3) * 0.03;

      placed.push({
        projectId: project.id,
        projectIndex,
        shot,
        position: [x, y, z],
        rotation: [0, rotY, rotZ],
        width,
        height,
      });
    });
  });

  return placed;
}

export function totalDepth(projects: readonly ShowcaseProject[]): number {
  return projects.length * DEPTH_PER_PROJECT;
}

/** 프로젝트 대역 중앙을 바라보게 되는 카메라 z. */
export function projectTargetZ(projectIndex: number): number {
  return -projectIndex * DEPTH_PER_PROJECT - DEPTH_PER_PROJECT / 2;
}

/** 카메라를 그 z 로 보내는 데 필요한 스크롤 진행률 [0,1]. */
export function progressForZ(z: number, depth: number): number {
  const p = (CAMERA_START_Z - z) / depth;
  return Math.min(1, Math.max(0, p));
}

/**
 * 카메라 z 로부터 "지금 어느 프로젝트를 지나는가"를 구한다. `CAMERA_START_Z`
 * 만큼의 진입 여유가 있으므로 진행률을 프로젝트 개수로 단순히 등분하면 어긋난다
 * (실측: progress 0.68 에서 실제 카메라는 아직 대역 1 안인데 단순 나눗셈은 대역
 * 2 라고 말했다). 대역 경계(z 의 배수)로 직접 판정한다.
 */
export function indexForZ(z: number, projectCount: number): number {
  const index = Math.floor(-z / DEPTH_PER_PROJECT);
  return Math.min(projectCount - 1, Math.max(0, index));
}

export interface CameraWaypoint {
  z: number;
  x: number;
  y: number;
}

/**
 * 카메라가 지나가는 경로. 스크롤이 단순히 x=0·y=0 직선으로 z 만 파고들면, 평면이
 * 옆으로 흩어져 있는 구간에서는 카메라가 바로 옆을 스쳐 지나가며 화면이 통째로
 * 비는 순간이 생긴다(실측: progress 0.32~0.4 구간에서 캔버스에 아무 것도 안 보임 —
 * 원인은 좁은 화각 안에 흩어진 평면이 전혀 들지 않았기 때문).
 *
 * 처음에는 평면 하나하나의 좌표로 웨이포인트를 만들었는데, 그러면 카메라가
 * 특정 순간 그 평면과 거의 같은 자리(x·y·z 전부)에 오게 되어 지나치게 가까워진다
 * — 자리표시자는 사진과 달리 클로즈업에 아무 정보가 없으므로(민무늬 면 하나뿐)
 * 그 순간은 "사진에 다가섬"이 아니라 "그냥 빈 화면"으로 보였다(실측). 그래서
 * 웨이포인트를 **평면 하나가 아니라 프로젝트 하나의 평균 자리**로 두고, 그마저도
 * 절반만 따라간다 — 카메라는 각 프로젝트의 배치를 향해 부드럽게 방향을 트는
 * 정도로만 움직이고, 어떤 평면과도 거의 겹치지 않는다.
 */
const WAYPOINT_APPROACH = 0.3;

export function buildCameraPath(
  placed: readonly PlacedShot[],
): readonly CameraWaypoint[] {
  const byProject = new Map<number, PlacedShot[]>();
  for (const p of placed) {
    const list = byProject.get(p.projectIndex) ?? [];
    list.push(p);
    byProject.set(p.projectIndex, list);
  }

  const path: CameraWaypoint[] = [{ z: CAMERA_START_Z, x: 0, y: 0 }];
  for (const [projectIndex, shots] of [...byProject.entries()].sort(
    (a, b) => a[0] - b[0],
  )) {
    const avgX =
      shots.reduce((sum, s) => sum + s.position[0], 0) / shots.length;
    const avgY =
      shots.reduce((sum, s) => sum + s.position[1], 0) / shots.length;
    path.push({
      z: projectTargetZ(projectIndex),
      x: avgX * WAYPOINT_APPROACH,
      y: avgY * WAYPOINT_APPROACH,
    });
  }

  const lastZ = placed[placed.length - 1]?.position[2] ?? CAMERA_START_Z;
  path.push({ z: lastZ - DEPTH_PER_PROJECT / 2, x: 0, y: 0 });
  return path;
}

/** 카메라 z 에서의 경로 좌표를 선형 보간으로 구한다. `path` 는 z 내림차순이어야 한다. */
export function cameraOffsetForZ(
  z: number,
  path: readonly CameraWaypoint[],
): { x: number; y: number } {
  if (path.length === 0) return { x: 0, y: 0 };
  if (z >= path[0].z) return { x: path[0].x, y: path[0].y };

  for (let i = 0; i < path.length - 1; i += 1) {
    const a = path[i];
    const b = path[i + 1];
    if (z <= a.z && z >= b.z) {
      const span = a.z - b.z;
      const t = span === 0 ? 0 : (a.z - z) / span;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
  }
  const last = path[path.length - 1];
  return { x: last.x, y: last.y };
}
