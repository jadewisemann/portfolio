"use client";

import dynamic from "next/dynamic";
import { useEnhancementGate } from "../useEnhancementGate";
import { HeroPoster } from "./HeroPoster";
import { useIsWide } from "./useIsWide";
import styles from "./HeroDiorama.module.css";

/**
 * 동적 임포트 + IntersectionObserver 뒤에 둔다(MOTION_LANGUAGE.md 1.4 조건 1).
 * `three` 청크는 `enhanced=true` 로 실제 마운트될 때만 네트워크에 나간다.
 */
const DynamicHeroScene = dynamic(
  () => import("./HeroScene").then((m) => m.HeroScene),
  { loading: () => null, ssr: false },
);

/*
  320px 에서는 씬을 켜지 않는다 — 세로 화면비에서는 데스크톱 구도의 원근
  산술이 성립하지 않고(가로 시야가 너무 좁다), 모바일은 별도 구성으로
  설계되어 있으므로(`layout.ts` 의 `heroItemsMobile`) 정적 포스터가 이미
  그 구성 자체다. 768px 이상에서만 라이브 씬으로 넘어간다(`useIsWide`).
*/

export function HeroDiorama() {
  const { ref, enhanced } = useEnhancementGate<HTMLDivElement>();
  const wide = useIsWide();
  const live = enhanced && wide;

  return (
    <div className={styles.stage} ref={ref}>
      <div aria-hidden={live ? "true" : undefined} className={styles.poster} data-hidden={live || undefined}>
        <HeroPoster />
      </div>
      {live ? (
        <div className={styles.scene}>
          <DynamicHeroScene />
        </div>
      ) : null}
      <h1 className={styles.name}>
        {/*
          좁은 화면에서는 두 조각이 각각 한 줄이 되고, 640px 이상에서는 다시 한 줄로
          붙는다. 320 에서 한 줄을 고집하면 모노 12자가 40px 을 넘을 수 없고 — 실측 —
          데스크톱 160px 옆에서 그 급수는 이름이 아니라 각주로 보인다.
        */}
        <span className={styles.namePart}>jade</span>
        <span className={styles.namePart}>wisemann</span>
      </h1>
    </div>
  );
}
