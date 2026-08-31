"use client";

import dynamic from "next/dynamic";
import { StaticFallback } from "../StaticFallback";
import { useEnhancementGate } from "../useEnhancementGate";

/**
 * 동적 임포트 + IntersectionObserver 뒤에 둔다(MOTION_LANGUAGE.md 1.4 조건 1).
 * `three` · `@react-three/fiber` · `@react-three/drei` 청크는 이 컴포넌트가
 * `enhanced=true` 로 실제 렌더될 때만 네트워크에 나간다 — 첫 페인트 경로 밖이고,
 * `/` 라우트의 번들에는 아예 포함되지 않는다(라우트별 코드 스플리팅).
 */
const DynamicGalleryScene = dynamic(
  () => import("./GalleryScene").then((m) => m.GalleryScene),
  { loading: () => null, ssr: false },
);

export function GalleryCanvas() {
  const { ref, enhanced } = useEnhancementGate<HTMLDivElement>();

  return (
    <div>
      {/* 크기 없는 관찰 지점. 아래 콘텐츠가 정적/씬 사이를 오가도 위치가 흔들리지
          않는다 — 형제 요소가 아니라 이 지점의 위치는 항상 이전 형제들에만 좌우된다. */}
      <div ref={ref} />
      {enhanced ? <DynamicGalleryScene /> : <StaticFallback />}
    </div>
  );
}
