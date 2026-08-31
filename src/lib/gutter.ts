// 거터 기호 어휘. ART_DIRECTION.md 3.2 가 정본입니다.
// 기호는 IBM Plex Mono 에만 있는 것도 있으므로 반드시 등폭으로 조판합니다
// (U+21BA ↺ 는 Sans KR 에 없습니다. scripts/subset-fonts.mjs 의 cmap 가드 참고).

export const MARKS = {
  blocked: "−",
  built: "+",
  moved: "~",
  reverted: "↺",
  confirmed: "=",
} as const;

export type Mark = keyof typeof MARKS;
