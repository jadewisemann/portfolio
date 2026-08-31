import styles from "@/components/candidates/Lines.module.css";

/**
 * 손으로 끊은 여러 줄을 각자 leaf 블록 요소로 렌더한다. Field.module.css 의
 * 설명과 같은 이유(잉크 측정)로 `<br/>` 을 쓰지 않는다.
 */
export function Lines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((line) => (
        <span className={styles.line} key={line}>
          {line}
        </span>
      ))}
    </>
  );
}
