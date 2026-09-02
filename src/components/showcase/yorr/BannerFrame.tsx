import { PlaceholderFrame } from "@/components/showcase/PlaceholderFrame";
import type { Shot } from "@/components/showcase/shots";
import styles from "./BannerFrame.module.css";

/**
 * `shot.alt` 에서 화면에 보일 캡션만 뽑는다. `shots.ts` 의 alt 는 "…자리표시자[,
 * 세부]" 형태다 — 스크린리더에는 그 문구 그대로가 옳다(정확한 설명, WCAG 1.1.1).
 * 그러나 화면에 그 단어를 그대로 찍으면 액자가 "나는 비어 있다"고 스스로
 * 광고하는 꼴이 된다(실측 결함, 성능/시각 감사 §6) — 액자는 액자로만 읽혀야
 * 한다. "자리표시자"만 지우고 나머지(프로젝트 · 화면 종류 · 세부)는 그대로
 * 남긴다 — 새 문구를 짓지 않는다.
 */
function visibleCaption(alt: string): string {
  return alt
    .replace(/\s*자리표시자\s*/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 프로젝트 페이지의 전폭 액자 하나. 랜딩의 회랑을 지나온 독자가 "다른 사이트로
 * 넘어왔다"고 느끼지 않도록, 회랑과 같은 액자 언어(PlaceholderFrame)를 그대로 쓰되
 * 한 장을 페이지 폭 전체로 편다 — 브리프의 "두 개의 똑같은 빈 액자" 실패를 대신한다.
 *
 * 데스크톱/모바일 두 장을 마크업에 함께 두고 CSS 미디어 쿼리로 가른다
 * (`HeroPoster.tsx` 와 같은 기법). JS 없이도 화면 폭에 맞는 화면비가 보여야 한다.
 *
 * 화면 캡션은 `visibleCaption(shot.alt)` 로 "자리표시자" 를 뺀 값을 보이고
 * (`aria-hidden`), 원본 `shot.alt` 는 `sr-only` 로 스크린리더에 그대로 남긴다.
 * 액자 자체는 `src` 가 없을 때 `aria-hidden` 이므로(PlaceholderFrame), 이
 * `sr-only` 텍스트가 스크린리더에 "여기에 무엇이 올지"를 알려주는 유일한 경로다.
 */
export function BannerFrame({ desktopShot, mobileShot }: { desktopShot: Shot; mobileShot: Shot }) {
  return (
    <div className={styles.banner}>
      <div className={styles.slot} data-set="mobile">
        <PlaceholderFrame className={styles.frame} shot={mobileShot} />
        <p aria-hidden="true" className={styles.caption}>
          {visibleCaption(mobileShot.alt)}
        </p>
        <span className="sr-only">{mobileShot.alt}</span>
      </div>
      <div className={styles.slot} data-set="desktop">
        <PlaceholderFrame className={styles.frame} shot={desktopShot} />
        <p aria-hidden="true" className={styles.caption}>
          {visibleCaption(desktopShot.alt)}
        </p>
        <span className="sr-only">{desktopShot.alt}</span>
      </div>
    </div>
  );
}
