"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
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

  /*
    실측 결함(성능 감사 §2): 폴백을 `live`(청크가 **요청된** 시점)에 치우면
    청크 로드·파싱·첫 렌더 사이 빈 무대가 남는다(4× CPU 스로틀 + 느린
    네트워크에서 1133ms). `live` 로 바로 스위치하지 않고, 라이브 갤러리가
    실제로 첫 프레임을 그릴 때까지 폴백을 겹쳐 둔다(`FirstFrameSignal`).

    CLS 수정(성능 감사 §1)도 같은 구조를 쓴다: `.slot` 이 라이브/폴백 어느
    쪽이든 항상 같은 높이(`--corridor-reserve`)를 차지하므로, 이 스위치는
    "무엇이 그려지는가"만 바꾸고 "문서가 얼마나 큰가"는 바꾸지 않는다
    (`CorridorCanvas.module.css`).
  */
  const [liveReady, setLiveReady] = useState(false);
  const handleLivePainted = useCallback(() => setLiveReady(true), []);

  // `live` 가 바뀔 때(예: 리사이즈로 `wide` 가 뒤집혀) 다음번에도 첫 프레임을
  // 기다리도록 되돌린다 — 렌더 도중 조정하는 React 의 표준 패턴이다(prop 변화에
  // 반응해 상태를 리셋할 때 useEffect 대신 쓴다. https://react.dev/learn/you-might-not-need-an-effect).
  const [prevLive, setPrevLive] = useState(live);
  if (live !== prevLive) {
    setPrevLive(live);
    setLiveReady(false);
  }

  return (
    <div ref={ref}>
      <div className={styles.mobile}>
        <MobileFilmstrip />
      </div>
      <div className={styles.desktop}>
        <div className={styles.slot}>
          <div
            aria-hidden={liveReady ? "true" : undefined}
            className={styles.fallbackLayer}
            data-hidden={liveReady || undefined}
          >
            <StaticFallback />
          </div>
          {live ? (
            <div className={styles.liveLayer}>
              <DynamicCorridorGallery onFirstFrame={handleLivePainted} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
