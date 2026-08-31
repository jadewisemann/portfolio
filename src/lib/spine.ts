// 척추(spine) 산술. 이음선(`src/lib/seam.ts`)의 클램프 규칙을 그대로 재사용하고,
// 여기서는 그 위에 "한 문자열 라벨" 과 "정수 픽셀 x 좌표"만 더합니다.
//
// 왜 seam.ts 를 다시 구현하지 않는가: 최소 폭 12% · 0%/100% 예외 · clamped 표시는
// 이미 seam.ts 에서 단위 테스트로 지켜지고 있는 데이터 무결성 규칙입니다
// (ART_DIRECTION.md 3.3~3.5). 척추는 그 값을 뷰포트 전체에 펴 바르는 것뿐입니다.

import { seam, type Ratio, type Seam } from "./seam";

export type { Ratio, Seam };

export type SpineGeometry = Seam & {
  /**
   * 이음선 위에 얹는 단일 문자열. 콜론을 포함해야 비율로 읽힙니다
   * (ART_DIRECTION.md 3.4). 0%·100% 절은 예외로 그 자체가 가장 중요한 사실이므로
   * 분수가 아니라 퍼센트로 적습니다 — "0 : 1" 은 존재하지 않는 분모를 지어내는 것입니다.
   */
  label: string;
};

export function computeSpine(ratio: Ratio): SpineGeometry {
  const s = seam(ratio);
  const label =
    s.edge === "a" ? "0%" : s.edge === "b" ? "100%" : `${ratio.a} : ${ratio.b}`;
  return { ...s, label };
}

/**
 * 척추의 정수 픽셀 x 좌표. `containerWidth` 는 척추가 펴 바르는 전폭(보통
 * `document.documentElement.clientWidth`)입니다.
 *
 * 정수로 반올림합니다 — 소수점 좌표는 1px 선이 두 픽셀에 걸쳐 번지게 합니다
 * (DESIGN_SYSTEM.md 6절, globals.css 의 `round(down, …, 1px)` 과 같은 이유).
 */
export function spineX(percentA: number, containerWidth: number): number {
  return Math.round((percentA / 100) * containerWidth);
}
