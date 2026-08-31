"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Best-of-N 실험 전용 관찰자입니다.
 *
 * S1 절이 뷰포트에 절반 이상 들어오면 참을 돌려줍니다. MOTION_LANGUAGE.md 5.2 의
 * 규칙을 그대로 따릅니다 — 콜백은 불리언 하나만 주고, 보간은 호출하는 쪽(CSS 또는
 * Motion `layout`)이 합니다. 이 훅 자체는 아무 스타일도 쓰지 않습니다.
 */
export function useSceneActive<T extends HTMLElement>(threshold = 0.5) {
  const ref = useRef<T | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, active };
}
