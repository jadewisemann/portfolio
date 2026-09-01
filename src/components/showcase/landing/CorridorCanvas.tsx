"use client";

import dynamic from "next/dynamic";
import { StaticFallback } from "../StaticFallback";
import { useEnhancementGate } from "../useEnhancementGate";
import { MobileFilmstrip } from "./MobileFilmstrip";
import { useIsWide } from "./useIsWide";
import styles from "./CorridorCanvas.module.css";

/**
 * 동적 임포트 + IntersectionObserver 뒤에 둔다(MOTION_LANGUAGE.md 1.4 조건 1).
 */
const DynamicCorridorGallery = dynamic(
  () => import("./CorridorGallery").then((m) => m.CorridorGallery),
  { loading: () => null, ssr: false },
);

/**
 * 두 구성을 항상 마크업에 함께 두고 CSS 미디어 쿼리로 가른다(`layout.ts` 의
 * 채널 산술과 같은 이유의 원칙: 자바스크립트가 아니라 존재 자체가 대안이다).
 *
 * - 768px 미만: `MobileFilmstrip` — WebGL·JS 가 없어도 완전한 화면이다.
 * - 768px 이상: JS·WebGL·뷰포트 폭 조건을 전부 만족하면 라이브 갤러리,
 *   아니면 `StaticFallback`(WebGL 없음·JS 없음·축소 모션 공통 대안).
 */
export function CorridorCanvas() {
  const { ref, enhanced } = useEnhancementGate<HTMLDivElement>();
  const wide = useIsWide();
  const live = enhanced && wide;

  return (
    <div ref={ref}>
      <div className={styles.mobile}>
        <MobileFilmstrip />
      </div>
      <div className={styles.desktop}>
        {live ? <DynamicCorridorGallery /> : <StaticFallback />}
      </div>
    </div>
  );
}
