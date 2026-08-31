// 화면에 표시되는 수치의 **형태**만 정의합니다. 값은 이 저장소에 두지 않습니다.
//
// 사실의 정본은 형제 저장소 `../_jadewisemann/ref/` 이고, 이 저장소로 옮겨 적지 않습니다.
// 옮겨 적었다가 공개 저장소에 개인 사실과 제3자 실명이 올라갈 뻔했고, 정본을 둘로 만드는
// 일이기도 했습니다.
//
// 타입이 강제하는 것:
//   - `grade` 가 "A" | "B" 이므로 근거 등급이 낮은 값은 표현할 수 없습니다.
//   - `denominator` 가 필수이므로 맨 숫자를 화면에 놓을 수 없습니다.
//   - `source` 가 필수이므로 근거 위치를 대지 않으면 값을 넘길 수 없습니다.
//   - `selfMeasured` 인 항목은 `measuredAt` 과 `command` 를 함께 요구합니다.

export type Grade = "A" | "B";

export type Unit = "%" | "%p" | "LOC" | "파일" | "커밋" | "건" | "개" | "명" | "주";

type Base = {
  id: string;
  label: string;
  value: number;
  unit: Unit;
  denominator: { label: string; value?: number };
  /** 근거 위치. 형제 저장소 기준 상대 경로와 절 또는 행. */
  source: string;
  grade: Grade;
  note?: string;
};

export type Reading =
  | (Base & { selfMeasured?: false })
  | (Base & { selfMeasured: true; measuredAt: string; command: string });
