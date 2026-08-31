import styles from "./NameScreen.module.css";

/**
 * 세 프로토타입이 공유하는 첫 화면. 이름 하나뿐이다.
 *
 * 모션이 없다 — 진입 애니메이션조차 문구 하나를 넘는 순간이 없으므로 여기서는
 * 만들 것이 없다. 다음 화면(쇼케이스)은 스크롤해야 나온다.
 */
export function NameScreen() {
  return (
    <div className={styles.stage}>
      <h1 className={styles.name}>jadewisemann</h1>
    </div>
  );
}
