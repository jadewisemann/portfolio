"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion-preference";

/**
 * 절이 뷰포트에 들어올 때 한 번만 올라오며 나타납니다.
 *
 * 두 가지 방식이 있습니다:
 *
 *   - 기본 — 20px 아래에서 올라오며 밝아집니다. 문단 · 목록 · 카드에 씁니다.
 *   - `mask` — 아래에서 **닦아 올리듯** 드러납니다(`clip-path`). 제목처럼 한 덩어리로
 *     읽혀야 하는 큰 활자에만 씁니다. 여러 요소가 든 블록에 걸면 서로 다른 높이의
 *     글자가 같은 선에서 잘려 어색해집니다.
 *
 * 축소 모션에서는 최종 상태를 바로 렌더합니다. 여기서 한 번, 그리고 첫 페인트 전에
 * `globals.css` 의 `[data-motion-reduce]` 규칙이 한 번 — 두 겹인 이유는 하이드레이션
 * 전에는 이 컴포넌트가 아직 없기 때문입니다.
 */
const SPINE_SECONDS = 0.72;
const SPINE_EASE = [0.16, 1, 0.3, 1] as const;

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** 같은 절 안에서 순서를 만들 때만 씁니다. 초 단위입니다. */
  delay?: number;
  /** 아래에서 닦아 올리는 방식. 큰 제목 전용입니다. */
  mask?: boolean;
}

export function Reveal({ children, className, delay = 0, mask = false }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const initial = mask
    ? { opacity: 1, y: 0, clipPath: "inset(0% 0% 100% 0%)" }
    : { opacity: 0, y: 20 };
  const animate = mask
    ? { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }
    : { opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      data-enter
      initial={initial}
      transition={{ duration: SPINE_SECONDS, delay, ease: SPINE_EASE }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -8% 0px" }}
      whileInView={animate}
    >
      {children}
    </motion.div>
  );
}
