"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { useReducedMotion } from "@/lib/motion-preference";

/**
 * 스크롤 이송을 Lenis 가 가져갑니다 — 휠 한 번의 거리를 관성으로 풀어내고, 앵커
 * 이동도 같은 곡선으로 처리합니다.
 *
 * 왜 이송까지 가져가는가: 이 사이트의 연출은 대부분 스크롤에 묶여 있습니다(패럴랙스 ·
 * 히어로의 후퇴 · 마키). 브라우저 기본 휠은 계단식으로 튀므로 그 값들도 함께 튑니다.
 * 이송을 한 곳이 소유해야 화면 전체가 한 덩어리로 움직입니다.
 *
 * **축소 모션에서는 아예 마운트하지 않습니다.** 관성은 이동이고, 이동은 축소 모션이
 * 없애기로 한 것입니다. 스크롤 자체는 브라우저 기본 동작으로 그대로 남습니다 —
 * 기능이 사라지지 않는 것이 규칙입니다.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      // 휠 한 번이 풀리는 시간. 길면 「무겁다」가 아니라 「느리다」가 됩니다.
      duration: 1.05,
      // 끝이 죽지 않는 지수 감쇠. 관성의 성격을 정하는 유일한 값입니다.
      easing: (t: number) => 1 - Math.pow(1 - t, 3.2),
      // 터치는 손가락이 곧 위치이므로 관성을 얹지 않습니다.
      syncTouch: false,
      touchMultiplier: 1,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
