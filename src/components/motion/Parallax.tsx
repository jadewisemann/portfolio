"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion-preference";

/**
 * 스크롤 위치에 묶인 세로 이동. 요소가 뷰포트를 지나가는 동안 `-distance` 에서
 * `+distance` 까지 갑니다.
 *
 * 값이 스크롤의 함수인 것이 요점입니다 — 진입 전이(`Reveal`)가 「한 번 촉발되고 끝」인
 * 것과 달리, 이쪽은 스크롤을 되감으면 값도 되감깁니다. 그래서 지면이 여러 층으로
 * 갈라져 보입니다.
 *
 * 축소 모션에서는 `distance` 를 0 으로 두어 아무것도 움직이지 않습니다. 요소는 그대로
 * 자기 자리에 있습니다.
 */
export interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /** 최대 이동 거리(px). 값이 클수록 더 뒤(또는 앞)에 있는 것처럼 읽힙니다. */
  distance?: number;
  /** 뒤로 밀린 층은 느리게(양수), 앞으로 나온 층은 빠르게(음수) 움직입니다. */
  direction?: 1 | -1;
}

export function Parallax({
  children,
  className,
  distance = 60,
  direction = 1,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const travel = reduced ? 0 : distance * direction;
  const y = useTransform(scrollYProgress, [0, 1], [travel, -travel]);

  return (
    <motion.div className={className} ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
}
