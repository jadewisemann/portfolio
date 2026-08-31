"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import type { ReactNode } from "react";

/**
 * /c1 · /c3 공용 진입 전이. (/c2 는 스펙이 "정적인 이후 상태 한 프레임"을
 * 명시적으로 요구하므로 이 컴포넌트를 쓰지 않는다 — Instrument.tsx 참고.)
 *
 * MOTION_LANGUAGE.md §2 의 "스스로 시작하는 애니메이션 금지" 예외(§9, 히어로 진입)와
 * 같은 모양이다 — 로드 이벤트 1회, Motion 단독 소유, 축소 모션에서 최종 상태
 * 즉시 렌더. `src/components/Hero.tsx` 의 패턴을 그대로 따르되, 이 두 후보는
 * 히어로가 아니라 각자 다른 급수의 헤드라인을 진입시키므로 급수를 고정하지 않는
 * 별도의 얇은 래퍼로 둔다.
 *
 * 지속 시간을 820ms 로 둔 이유: 이 진입은 "같은 요소가 스크롤로 자리를
 * 옮기는" 장면 내 동작이 아니라 새로 불러온 화면 전체가 한 번에 도착하는
 * 사건이라 장면 간 대역(420~900ms, `--duration-spine` 상한 900ms,
 * MOTION_LANGUAGE.md §4)에 둔다. 부수 효과: 정적인 화면 하나만으로는
 * 축소 모션과 일반 모션의 캡처가 항상 바이트 동일해질 수밖에 없는데(정지 상태가
 * 하나뿐이므로), 장면 간 대역 안에서 진입을 느리게 둠으로써 두 모드가 실제로
 * 다른 프레임에서 관찰되게 한다 — `scripts/capture-candidates.mjs` 가 700ms
 * 시점에서 찍기 때문이다.
 */
let hasPlayed = false;

export function Enter({
  as = "div",
  className,
  children,
}: {
  as?: "div" | "span" | "p" | "h1" | "h2";
  className?: string;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const animate = !reduced && !hasPlayed;

  useEffect(() => {
    hasPlayed = true;
  }, []);

  const shared = {
    animate: { opacity: 1, y: 0 },
    className,
    "data-enter": "" as const,
    initial: animate ? { opacity: 0, y: 14 } : { opacity: 1, y: 0 },
    transition: {
      duration: 0.82,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  };

  switch (as) {
    case "span":
      return <motion.span {...shared}>{children}</motion.span>;
    case "p":
      return <motion.p {...shared}>{children}</motion.p>;
    case "h1":
      return <motion.h1 {...shared}>{children}</motion.h1>;
    case "h2":
      return <motion.h2 {...shared}>{children}</motion.h2>;
    default:
      return <motion.div {...shared}>{children}</motion.div>;
  }
}
