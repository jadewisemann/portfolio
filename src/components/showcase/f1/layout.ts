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
export const DEPTH_PER_PROJECT = 6;

const MOBILE_HEIGHT = 2.6;
const DESKTOP_WIDTH = 4.2;

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

      const x = noise(seed) * 1.8;
      const y = noise(seed + 1) * 0.5;
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
