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
      aria-hidden={shot.src ? undefined : "true"}
      className={className ? `${styles.frame} ${className}` : styles.frame}
      style={{ aspectRatio: `${shot.width} / ${shot.height}`, ...style }}
    >
      {shot.src ? <img alt={shot.alt} src={shot.src} /> : null}
    </figure>
  );
}
