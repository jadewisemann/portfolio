import styles from "./Field.module.css";
import { RULE_COUNT, RULE_PITCH, RULE_X0, RULE_Y0, marks1440, marks1920, ruleLength } from "./field-data";

/**
 * /d1 — 무리 (FIELD THAT REGROUPS). 첫 뷰포트 전용, 정적 렌더.
 *
 * 스크린에 글자는 이름 하나뿐이다(오너 결정, 2026-08-31). 마크는 전부 텍스트가
 * 없는 leaf 요소(빈 span)로 렌더한다 — `scripts/capture-candidates.mjs` 의
 * `firstScreenChars` 는 leaf 요소의 `textContent` 를 세므로, 마크에 글리프 문자를
 * 넣으면(예: "■") 그 자체가 "글자"로 집계된다.
 *
 * 세 뷰포트 변형을 전부 DOM에 두고 미디어 쿼리로 하나만 보이게 한다
 * (Field.module.css) — d2 구현 노트가 요구하는 "미디어 쿼리로 전환되는 뷰포트별
 * 정적 그림"과 같은 패턴이다. JS 로 뷰포트를 측정하지 않는다.
 */
const NAME = "jadewisemann";

export function Field() {
  return (
    <main className={styles.stage} id="main">
      <div aria-hidden="true" className={styles.plane} data-bp="1920">
        {marks1920.map((m, i) => (
          <span
            className={styles.cell}
            key={i}
            style={{ left: m.x - 27, top: m.y - 20 }}
          >
            <span className={styles.mark} />
          </span>
        ))}
      </div>

      <div aria-hidden="true" className={styles.plane} data-bp="1440">
        {marks1440.map((m, i) => (
          <span
            className={styles.cell}
            key={i}
            style={{ left: m.x - 27, top: m.y - 18 }}
          >
            <span className={styles.mark} />
          </span>
        ))}
      </div>

      <div aria-hidden="true" className={styles.column} data-bp="320">
        {Array.from({ length: RULE_COUNT }, (_, i) => (
          <span
            className={styles.rule}
            key={i}
            style={{
              top: RULE_Y0 + i * RULE_PITCH,
              left: RULE_X0,
              width: ruleLength(i),
            }}
          />
        ))}
      </div>

      <p className={styles.name}>{NAME}</p>
    </main>
  );
}
