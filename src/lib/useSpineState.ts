"use client";

// 척추(spine) 재배치를 촉발하는 두 훅. 어느 쪽도 시각 속성을 계산하지 않습니다 —
// IntersectionObserver 는 불리언(지금 몇 번째 절인가) 하나만 주고, 보간은 호출하는
// 쪽의 Motion `animate` 가 합니다 (MOTION_LANGUAGE.md 5.1 · 5.2).

import { useEffect, useState } from "react";

/**
 * 지금 뷰포트 중앙 근처에 걸린 절의 인덱스.
 *
 * **768px 미만에서는 관찰자를 만들지 않습니다** (MOTION_LANGUAGE.md 5.2). 모바일에는
 * 절을 가로지르는 단일 척추가 없으므로 관찰할 이유가 없습니다 — 각 절이 자기 비율을
 * 정적으로 그립니다.
 */
export function useActiveSceneIndex(ids: readonly string[]): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (ids.length === 0) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;

    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => n !== null);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 절이 연속하므로 이 선을 지나는 절은 항상 정확히 하나입니다.
        const hit = entries.filter((e) => e.isIntersecting).at(-1);
        if (!hit) return;
        const index = nodes.indexOf(hit.target as HTMLElement);
        if (index !== -1) setActive(index);
      },
      { rootMargin: "-40% 0px -59% 0px", threshold: [0] },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/**
 * 지금 활성 절의 문서 안 세로 위치(`offsetTop`). v2("흐르는 척추")가 씁니다 —
 * 척추가 자신을 담은 조상(`position: relative`)을 기준으로 그 절 위에 내려앉으려면
 * 그 절의 문서상 오프셋이 필요합니다. 리사이즈에서 다시 잽니다.
 */
export function useActiveSceneTop(ids: readonly string[], activeIndex: number): number {
  const [top, setTop] = useState(0);

  useEffect(() => {
    function measure() {
      const id = ids[activeIndex];
      if (!id) return;
      const el = document.getElementById(id);
      if (el) setTop(el.offsetTop);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [ids, activeIndex]);

  return top;
}

/**
 * 척추가 펴 바르는 전폭. `document.documentElement.clientWidth` 를 씁니다
 * (스크롤바를 뺀 값 — `window.innerWidth` 는 스크롤바만큼 밀립니다).
 *
 * 리사이즈를 처리합니다 (요구사항: "Handle resize"). `requestAnimationFrame` 은
 * 앱 소스에서 쓰지 않으므로(MOTION_LANGUAGE.md 8절) 리스너를 그대로 답니다.
 */
export function useViewportWidth(): number {
  const [width, setWidth] = useState<number>(() =>
    typeof document === "undefined" ? 1280 : document.documentElement.clientWidth,
  );

  useEffect(() => {
    function onResize() {
      setWidth(document.documentElement.clientWidth);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return width;
}
