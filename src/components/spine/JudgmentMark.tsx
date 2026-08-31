import { MARKS, type Mark } from "@/lib/gutter";

/**
 * 판단 기호. 척추 머리에 붙습니다 (ART_DIRECTION.md 3.7 개정 — 거터 레일 삭제,
 * 판단 기호는 척추 머리로 옮겼습니다). 독자의 눈이 이미 보고 있는 비율 라벨 옆입니다.
 *
 * 글리프는 aria-hidden, 접근 가능한 이름은 sr-only 텍스트가 만듭니다
 * (DESIGN_SYSTEM.md 7절). `↺`(U+21BA) 는 Sans KR 에 없으므로 등폭으로만 조판합니다
 * (`src/lib/gutter.ts` 참고).
 */
export function JudgmentMark({ mark, label }: { mark: Mark; label: string }) {
  return (
    <span className="sp-mark font-mono">
      <span aria-hidden="true">{MARKS[mark]}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
