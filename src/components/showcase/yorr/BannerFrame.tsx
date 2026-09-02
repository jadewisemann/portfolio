import { PlaceholderFrame } from "@/components/showcase/PlaceholderFrame";
import type { Shot } from "@/components/showcase/shots";
import styles from "./BannerFrame.module.css";

/**
 * 프로젝트 페이지의 전폭 액자 하나. 랜딩의 회랑을 지나온 독자가 "다른 사이트로
 * 넘어왔다"고 느끼지 않도록, 회랑과 같은 액자 언어(PlaceholderFrame)를 그대로 쓰되
 * 한 장을 페이지 폭 전체로 편다 — 브리프의 "두 개의 똑같은 빈 액자" 실패를 대신한다.
 *
 * 데스크톱/모바일 두 장을 마크업에 함께 두고 CSS 미디어 쿼리로 가른다
 * (`HeroPoster.tsx` 와 같은 기법). JS 없이도 화면 폭에 맞는 화면비가 보여야 한다.
 *
 * 캡션은 `shot.alt` 를 그대로 쓴다 — 새 문구를 짓지 않고, 이미 검증된 값만 보인다.
 * 액자 자체는 `src` 가 없을 때 `aria-hidden` 이므로(PlaceholderFrame), 캡션은 그
 * 바깥의 일반 텍스트로 둬서 스크린리더에도 "여기에 무엇이 올지"가 남는다.
 */
export function BannerFrame({ desktopShot, mobileShot }: { desktopShot: Shot; mobileShot: Shot }) {
  return (
    <div className={styles.banner}>
      <div className={styles.slot} data-set="mobile">
        <PlaceholderFrame className={styles.frame} shot={mobileShot} />
        <p className={styles.caption}>{mobileShot.alt}</p>
      </div>
      <div className={styles.slot} data-set="desktop">
        <PlaceholderFrame className={styles.frame} shot={desktopShot} />
        <p className={styles.caption}>{desktopShot.alt}</p>
      </div>
    </div>
  );
}
