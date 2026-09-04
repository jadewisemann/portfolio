import type { CSSProperties } from "react";
import type { Shot } from "./shots";
import styles from "./PlaceholderFrame.module.css";

/**
 * 스크린샷 한 장의 DOM 표현. `shot.src` 가 비어 있으면 자리표시자 면만 그린다.
 * 실사진이 오면 (`shots.ts` 에서 `src` 를 채우면) 같은 자리에 이미지가 채워진다 —
 * 이 컴포넌트를 고치지 않아도 된다.
 */
export function PlaceholderFrame({
  shot,
  className,
  style,
}: {
  shot: Shot;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <figure
      aria-hidden={shot.src || shot.video ? undefined : "true"}
      className={className ? `${styles.frame} ${className}` : styles.frame}
      style={{ aspectRatio: `${shot.width} / ${shot.height}`, ...style }}
    >
      {shot.video ? (
        /*
          gif 처럼: 소리 없이 자동 반복, 조작 없음 (MOTION_LANGUAGE.md 2절의 「프로젝트 매체」
          예외). 축소 모션에서는 CSS 가 영상을 숨기고 옆의 포스터 이미지를 보인다 —
          `[data-motion-reduce]` 는 첫 페인트 전에 서므로 영상이 한 프레임도 돌지 않는다.
        */
        <>
          <video
            className={styles.loop}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={shot.src || undefined}
            src={shot.video}
            aria-label={shot.alt}
          />
          {shot.src ? <img className={styles.still} alt={shot.alt} src={shot.src} /> : null}
        </>
      ) : shot.src ? (
        <img alt={shot.alt} src={shot.src} />
      ) : null}
    </figure>
  );
}
