"use client";

import { useEffect, useRef, useState } from "react";

/**
 * WebGL 씬을 켤지 정적 대안을 켤지 결정하는 단일 게이트.
 *
 * MOTION_LANGUAGE.md 1.4 의 조건: 「WebGL 없음 · JS 없음 · 축소 모션 각각에 설계된
 * 정적 대안이 있어야 한다. 숨기는 것은 대안이 아니다.」
 *
 * 이 훅은 정적 대안을 "만드는" 쪽이 아니라 — 그건 각 라우트의 StaticFallback 이 한다 —
 * 언제 그 대안 대신 씬을 마운트할지만 결정한다. 규칙은 하나:
 *
 *   enhanced = JS 실행됨(이 훅 자체가 실행된다는 것이 증거) && 뷰포트에 들어옴(IO) &&
 *              WebGL 사용 가능 && 축소 모션을 요청하지 않음
 *
 * 넷 중 하나라도 거짓이면 정적 폴백을 계속 보여준다 — 감추는 게 아니라 처음부터
 * 그 상태로 렌더된 것이다. 서버 렌더와 첫 클라이언트 렌더는 항상 `enhanced=false`
 * 여야 하이드레이션이 어긋나지 않는다.
 */
export function useEnhancementGate<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    if (!supportsWebGL()) return;

    if (typeof IntersectionObserver === "undefined") {
      // 관찰자가 없는 환경(구형 브라우저)에서는 씬을 강제하지 않는다 — 정적 대안이
      // 이미 완전한 화면이므로 그대로 둔다.
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEnhanced(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, enhanced };
}

let cachedWebgl: boolean | null = null;

function supportsWebGL(): boolean {
  if (cachedWebgl !== null) return cachedWebgl;
  try {
    const canvas = document.createElement("canvas");
    cachedWebgl = Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    cachedWebgl = false;
  }
  return cachedWebgl;
}
