"use client";

import { useEffect } from "react";

/**
 * 앵커로 이동했을 때 포커스를 대상 제목으로 옮깁니다.
 *
 * 왜 필요한가: `DecisionBlock` 의 h2 에 `tabIndex={-1}` 이 있어 코드만 보면 처리된
 * 것처럼 보이지만, 아무도 `.focus()` 를 부르지 않아 실제로는 포커스가 body 에 남아
 * 있었습니다. 접근성 감사가 실제 Chrome 클릭으로 확인했습니다.
 * 스크롤은 이동했고 거터 기호도 갱신되었는데 포커스만 움직이지 않았습니다.
 *
 * 왜 onClick 이 아니라 hashchange 인가: 뒤로 가기와 앞으로 가기, 그리고 모바일
 * 판단 인덱스까지 한 곳에서 덮기 위한 것입니다.
 *
 * `MOTION_LANGUAGE.md` 5.3 대로 착지를 알리는 것은 모션이 아니라 포커스입니다.
 * `preventDefault` 를 쓰지 않으므로 네이티브 즉시 점프가 그대로 유지됩니다.
 */
export function HashFocus() {
  useEffect(() => {
    const focusTarget = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      // 판단 블록의 제목이 포커스 대상입니다. 섹션 자체가 아닙니다.
      const heading = document.getElementById(`${id}-title`) ?? el;
      heading?.focus({ preventScroll: true });
    };

    focusTarget();
    window.addEventListener("hashchange", focusTarget);
    return () => window.removeEventListener("hashchange", focusTarget);
  }, []);

  return null;
}
