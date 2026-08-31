/** 칸의 내용. `src/content/golden.ts` 의 `Column` 형태와 같습니다. */
export type SpineColumnData = {
  heading: string;
  facts: readonly string[];
};

/**
 * 칸 본문. 어떤 비율에서도 부서지지 않는 등폭 짧은 사실만 담습니다
 * (ART_DIRECTION.md 3.5 — 두 칸의 활자는 같은 급수·무게, 한쪽을 각주로 만들지 않는다).
 *
 * `struck` 은 이 사이트에서 S7 한 곳에만 씁니다 — 지운 문장 전시(ART_DIRECTION.md §2).
 * 취소선은 색이 아니라 `text-decoration-line` 과 등급 기호(`Ø`)로 표시합니다.
 */
export function SceneColumn({
  column,
  struck,
  compact,
}: {
  column: SpineColumnData;
  struck?: { text: string; reason: string };
  /** 짧은 캡션만 필요한 자리(척추 V3 의 void 옆 sr-only 등)에서 facts 를 생략합니다. */
  compact?: boolean;
}) {
  return (
    <div className="sp-col-body">
      <h3 className="sp-col-heading font-mono">{column.heading}</h3>
      {compact ? null : (
        <ul className="sp-col-facts font-mono">
          {column.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      )}
      {struck ? (
        <p className="sp-struck font-mono">
          <span aria-hidden="true" className="sp-struck-mark">
            Ø
          </span>
          <span className="sp-struck-text">{struck.text}</span>
          <span className="sp-struck-reason">{struck.reason}</span>
        </p>
      ) : null}
    </div>
  );
}
