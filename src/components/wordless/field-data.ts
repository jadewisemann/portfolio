/**
 * /d1 — 무리 (field that regroups).
 *
 * 사실: CONTENT.md §2.5(등급 A) — 236파일 재편(커밋 `91b3363`). 파일은 그대로이고
 * 폴더만 바뀐 재편이다. 이 데이터 모듈은 그 236이라는 단일 사실을 좌표로 바꾼다.
 *
 * 좌표는 전부 빌드타임에 순수 함수로 계산된다. `Math.random` 을 쓰지 않는다 —
 * 그러면 서버 렌더와 클라이언트 렌더가 매 요청마다 달라져 하이드레이션이 어긋난다.
 * "무작위처럼 보이지만 결정적인" 값은 사인 해시로 만든다.
 */

export const RESTRUCTURED = 236;

export interface Mark {
  x: number;
  y: number;
}

/** 행 우선으로 채운다 — 남는 칸은 항상 마지막 행 끝에 남는다. */
function grid(
  cols: number,
  rows: number,
  pitchX: number,
  pitchY: number,
  x0: number,
  y0: number,
  count: number,
): Mark[] {
  const marks: Mark[] = [];
  const total = Math.min(count, cols * rows);
  for (let i = 0; i < total; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    marks.push({ x: x0 + col * pitchX, y: y0 + row * pitchY });
  }
  return marks;
}

/*
  1920×1080 — 20×12 격자(240칸)에 236개를 채운다. 남는 4칸(240−236)은 마지막 행
  끝에 남긴다 — 장식적으로 배치하지 않는다는 스펙 요구를 격자 순서 자체로 지킨다.
  격자 원점(56,168)과 피치(95,56)는 마지막 칸이 스펙이 준 범위(x→1864 근방,
  y→784)에 닿도록 역산한 값이다.
*/
export const marks1920 = grid(20, 12, 95, 56, 56, 168, RESTRUCTURED);

/*
  1440×900 — 스펙은 16×11 격자(176칸)를 지정했지만 176 < 236이라 236개를 다 담을
  수 없다(기하로 불가능한 지점, 최종 보고에 남긴다). c1 후보가 이미 쓴 크롭 관례
  (필드를 뷰포트가 잘라낸 것처럼 보이게 하는 처리, review/structural 참고)를 따라
  같은 필드의 잘린 창으로 176칸을 전부 채운다 — 값이 아니라 텍스처이므로 부분만
  보여도 사실을 왜곡하지 않는다. 236이라는 정확한 수는 1920과 320에서 온전하다.
*/
export const marks1440 = grid(16, 11, 84, 52, 56, 140, 16 * 11);

/** 0..1 사이의 결정적 유사 난수. */
function hashFrac(i: number): number {
  const x = Math.sin(i * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * 320×640 — 236개가 수평 척추로 눕는다. "흩뿌림이 아니라 지층"이어야 하므로
 * 저주파 밴딩(사인) 위에 소폭 지터만 얹는다 — 완전 난수는 스캐터로 읽힌다.
 */
export function ruleLength(i: number): number {
  const band = Math.sin(i / 14) * 0.5 + 0.5;
  const jitter = hashFrac(i) * 0.18;
  const t = Math.min(1, band * 0.82 + jitter);
  return Math.round(24 + t * (288 - 24));
}

export const RULE_COUNT = RESTRUCTURED;
export const RULE_PITCH = 2;
export const RULE_Y0 = 96;
export const RULE_X0 = 16;
