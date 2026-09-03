"use client";

import { useEffect, useState } from "react";

/**
 * CSS 사용자 정의 속성에서 색을 읽어 옵니다. 테마가 바뀌면 다시 읽습니다.
 *
 * 왜 이렇게 하는가: 팔레트의 정본은 `globals.css` 한 곳이어야 합니다. 3D 물체가 색을
 * 따로 들고 있으면 라이트 테마를 추가할 때 한쪽만 고쳐질 것이고, 그것은 눈으로만
 * 보입니다.
 *
 * `data-theme` 은 리액트 밖에서 바뀌므로(`preferences-store.ts`) `MutationObserver` 로
 * 지켜봅니다.
 */
export function useThemeColors(names: readonly string[]): string[] {
  const [colors, setColors] = useState<string[]>(() => names.map(() => "#808080"));

  useEffect(() => {
    const root = document.documentElement;

    const read = () => {
      const style = getComputedStyle(root);
      setColors(names.map((name) => style.getPropertyValue(name).trim() || "#808080"));
    };

    read();

    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
    // `names` 는 모듈 스코프 상수로만 넘깁니다 — 매 렌더 새 배열을 만들면 루프가 됩니다.
  }, [names]);

  return colors;
}
