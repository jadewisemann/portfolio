import styles from "./Double.module.css";

const NAME = "jadewisemann";

/**
 * /d3 — 이중 노출 (THE DOUBLE). 첫 뷰포트 전용, 정적 렌더.
 *
 * 사실: CONTENT.md §2.3(등급 A) — 같은 테스트 스위트(48개)를 두 번 돌리면 전역
 * branches 가 90.48% 와 91.43% 로 갈린다. 이 화면은 그 "같은 도형, 두 번째 실행,
 * 살짝 어긋난 결과"를 두 겹의 줄무늬로 옮긴다. 화면의 글자는 이름 하나뿐이다.
 *
 * 인상 A(정지)와 인상 B(press)는 CSS `repeating-linear-gradient` 배경으로
 * 그린다 — 줄 하나마다 DOM 노드를 만들지 않는다. 두 인상은 좌표만 다른 같은
 * 배경이고, `--signal-built` 문턱선 하나가 둘 사이를 가로지른다.
 *
 * press 는 `:active` 로만 만든다(포인터 다운) — 이 화면은 장식용 이중노출이지
 * 실제 내비게이션이 없으므로 키보드 포커스 대상으로 노출하지 않는다.
 */
export function Double() {
  return (
    <main className={styles.stage} id="main">
      <div aria-hidden="true" className={styles.plate} data-bp="1920">
        <div className={styles.impressionA} />
        <div className={styles.impressionB} />
        <div className={styles.threshold} />
      </div>

      <div aria-hidden="true" className={styles.plate} data-bp="1440">
        <div className={styles.impressionA} />
        <div className={styles.impressionB} />
        <div className={styles.threshold} />
      </div>

      <div aria-hidden="true" className={styles.plate} data-bp="320">
        <div className={styles.impressionA} />
        <div className={styles.impressionB} />
        <div className={styles.threshold} />
      </div>

      <p className={styles.name}>{NAME}</p>
    </main>
  );
}
