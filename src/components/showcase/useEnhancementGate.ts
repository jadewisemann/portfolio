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

    let cancelled = false;
    let confirmFrame = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        /*
          실측 결함: 뷰포트 아래(예: 900px 뷰포트에서 top: 900px)에 있는 래퍼가
          스크롤 전(`window.scrollY === 0`)에 켜졌다. 옵저버의 이 첫 콜백이
          `100dvh` 레이아웃이 자리 잡기 전에 실행되면 그 시점의 (아직 정착하지
          않은) 레이아웃을 보고 "닿았다"고 오판할 수 있다 — 히어로용으로 이미
          문서화한 것과 같은 dvh 경합이다. `isIntersecting` 을 그대로 믿지 않고
          다음 프레임에서 실제 DOM 치수로 다시 잰다. **여기서 disconnect 하지
          않는다** — 확인에 실패하면(레이아웃이 아직 안 정착했거나 정말로 화면
          밖이면) 옵저버가 계속 관찰하다가 상태가 실제로 바뀔 때 다시 알려준다.
          연결을 먼저 끊으면 그 실패가 영구히 고정된다(실제로 이 버그의 원인이
          바로 그것이었다 — 원래 코드는 첫 신호에서 바로 disconnect 했다).
        */
        confirmFrame = requestAnimationFrame(() => {
          if (cancelled) return;
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.5) {
            setEnhanced(true);
            io.disconnect();
          }
        });
      },
      // 아래쪽을 -50% 만큼 좁혀서, 뷰포트 절반 이상 들어와야 비로소
      // "다가왔다"고 본다. 로드 직후의 경계 오차를 확실히 벗어난다.
      { rootMargin: "0px 0px -50% 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      cancelAnimationFrame(confirmFrame);
      io.disconnect();
    };
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
