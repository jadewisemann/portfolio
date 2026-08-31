/**
 * /d2 — 닫힌 회로 (circuit with no exit).
 *
 * 사실: CONTENT.md §2.3(등급 A) — `World.ts` 의 렌더 루프가 `performance.now()`
 * 로 실측한 프레임 간격을 accumulator 반복 횟수와 clamp 분기에 먹인다. 그 결과
 * 같은 테스트를 두 번 돌리면 전역 branches 가 90.48%↔91.43% 로 흔들린다.
 * 이 화면은 그 사실을 "나가는 간선이 없는 순환"이라는 도형으로만 옮긴다 —
 * 문장은 이름 하나뿐이다.
 *
 * 좌표는 정수 픽셀이고 빌드타임 상수다. 세 뷰포트(1920·1440·320)마다 별도
 * `<svg>` 를 두고 미디어 쿼리로 전환한다(회로 컴포넌트 구현 노트).
 */

export interface Breakpoint {
  width: number;
  height: number;
  /** 보이는 1px 획. 화면 밖으로 두 끝이 나가는 열린 경로(1920·1440) 또는 닫힌 루프(320). */
  strokePath: string;
  /**
   * 안쪽 판정용 다각형(닫힌 path). 뷰포트 사각형과 evenodd 로 합치면 바깥쪽이 나온다.
   * 1920·1440 은 경로가 지면 경계에서 잘리는 지점을 꼭짓점으로 삼아 다각형을 닫는다.
   */
  insidePath: string;
  /** 44px 히트 밴드용 path — 보이는 획과 같은 좌표다(굵기만 다르다). */
  hitPath: string;
  name: { x: number; top: number; fontSize: number };
}

export const bp1920: Breakpoint = {
  width: 1920,
  height: 1080,
  // (화면 밖 왼쪽,140) → (1408,140) → 매듭 → (1408,896) → (472,896) → (화면 밖 아래)
  strokePath:
    "M -80,140 L 1408,140 L 1408,448 L 1596,448 L 1596,616 L 1408,616 L 1408,896 L 472,896 L 472,1160",
  hitPath:
    "M -80,140 L 1408,140 L 1408,448 L 1596,448 L 1596,616 L 1408,616 L 1408,896 L 472,896 L 472,1160",
  insidePath:
    "M0,140 L1408,140 L1408,448 L1596,448 L1596,616 L1408,616 L1408,896 L472,896 L472,1080 L0,1080 Z",
  name: { x: 224, top: 700, fontSize: 112 },
};

export const bp1440: Breakpoint = {
  width: 1440,
  height: 900,
  strokePath:
    "M -80,112 L 1064,112 L 1064,364 L 1204,364 L 1204,504 L 1064,504 L 1064,756 L 364,756 L 364,970",
  hitPath:
    "M -80,112 L 1064,112 L 1064,364 L 1204,364 L 1204,504 L 1064,504 L 1064,756 L 364,756 L 364,970",
  insidePath:
    "M0,112 L1064,112 L1064,364 L1204,364 L1204,504 L1064,504 L1064,756 L364,756 L364,900 L0,900 Z",
  name: { x: 168, top: 578, fontSize: 88 },
};

// 320 — 회로가 완결되어 프레임 안에 전부 들어온다(스펙: "닫힌 상태를 한눈에").
export const bp320: Breakpoint = {
  width: 320,
  height: 640,
  strokePath:
    "M40,112 L280,112 L280,392 L232,392 L232,448 L176,448 L176,392 L40,392 Z",
  hitPath:
    "M40,112 L280,112 L280,392 L232,392 L232,448 L176,448 L176,392 L40,392 Z",
  insidePath:
    "M40,112 L280,112 L280,392 L232,392 L232,448 L176,448 L176,392 L40,392 Z",
  name: { x: 40, top: 530, fontSize: 40 },
};

/** 28px 리듬 기판(ART_DIRECTION.md 3.11)의 y 좌표들 — 0 부터 height 까지. */
export function grainYs(height: number): number[] {
  const ys: number[] = [];
  for (let y = 0; y <= height; y += 28) ys.push(y);
  return ys;
}
