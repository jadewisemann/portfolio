"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

/**
 * R3F 씬 안에서 "첫 프레임이 실제로 그려졌다"를 부모(DOM)에 알린다.
 *
 * 실측 결함(성능 감사 §2): `HeroDiorama`·`CorridorCanvas` 는 정적 포스터/폴백을
 * `live`(WebGL·IO·축소 모션 게이트가 통과해 청크를 **요청한** 시점)에 숨겼다.
 * 청크 로드 · 파싱 · 첫 렌더 사이에 빈 무대가 남았다 — 무통제 300ms, 4× CPU
 * 스로틀 + 느린 네트워크에서 히어로 1664ms · 복도 1133ms.
 *
 * `useFrame` 콜백은 매 프레임 `gl.render` 직전에 실행되므로 그 첫 호출이 사실상
 * 첫 페인트 신호다 — `onCreated`(GL 컨텍스트만 준비된 시점, 씬 내용은 아직
 * 없을 수 있다)보다 정확하고, `live`(청크 요청 시점)보다 늦다. `frameloop="demand"`
 * 아래에서도 유효하다 — 데스크톱 게이트가 확정되면 씬을 마운트하는 쪽에서
 * 이미 최소 한 번의 `invalidate()`를 부르므로(카메라 초기화 이펙트) 이 콜백은
 * 상호작용을 기다리지 않고 곧 실행된다.
 */
export function FirstFrameSignal({ onFirstFrame }: { onFirstFrame: () => void }) {
  const firedRef = useRef(false);

  useFrame(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    onFirstFrame();
  });

  return null;
}
