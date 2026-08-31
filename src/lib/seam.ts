// 이음선의 산술. ART_DIRECTION.md 3.3·3.4·3.5 가 정본입니다.
//
// 이음선의 위치는 장식이 아니라 **그 절의 수치**입니다. 따라서 위치를 계산하는 코드가
// 곧 데이터 무결성 코드이고, 여기서 거짓말이 생기면 지면 전체가 거짓말을 합니다.
//
// 규칙 셋:
//   1. 어느 칸도 SEAM_MIN 미만이 되지 않습니다 — 3% 짜리 칸은 아무것도 담을 수 없습니다.
//   2. 0% 와 100% 는 예외로 실제로 0폭·전폭을 그립니다. 이 사이트에서 가장 중요한
//      두 사실이 그 값입니다 (관여 0건 · 단독 작성).
//   3. 폭이 실제 비율과 어긋나면 `clamped` 가 참이 되고, 호출하는 쪽이 화면에
//      그 사실을 밝힙니다. **라벨이 정본이고 폭은 근사입니다.**

/** 칸의 최소 폭(%). DESIGN_SYSTEM.md 6절의 `--seam-min` 과 같은 값입니다. */
export const SEAM_MIN = 12;

export type Ratio = {
  /** 왼쪽(상태 A)의 양 */
  a: number;
  /** 오른쪽(상태 B)의 양 */
  b: number;
  /** 라벨에 쓰는 A 의 뜻. 분모 없는 수치를 만들지 않기 위해 필수입니다. */
  aLabel: string;
  bLabel: string;
};

export type Seam = {
  /** 그려지는 폭(%). 0 과 100 은 그대로 나옵니다. */
  percent: number;
  /** 실제 비율(%). 반올림하지 않은 값입니다. */
  actual: number;
  /** 폭이 실제 비율과 어긋났는가. 참이면 화면에 밝혀야 합니다. */
  clamped: boolean;
  /** 한쪽 칸이 사라지는가. 사라지는 쪽의 이름이 들어갑니다. */
  edge: "a" | "b" | null;
};

export function seam(ratio: Ratio): Seam {
  const total = ratio.a + ratio.b;

  // 분모가 0 이면 비율이 존재하지 않습니다. 반으로 가르고 어긋남을 표시합니다 —
  // 조용히 50% 를 그리면 "비교했다"는 거짓말이 됩니다.
  if (total === 0) {
    return { percent: 50, actual: 50, clamped: true, edge: null };
  }

  const actual = (ratio.a / total) * 100;

  if (actual === 0) return { percent: 0, actual, clamped: false, edge: "a" };
  if (actual === 100) return { percent: 100, actual, clamped: false, edge: "b" };

  const percent = Math.min(100 - SEAM_MIN, Math.max(SEAM_MIN, actual));

  return { percent, actual, clamped: percent !== actual, edge: null };
}
