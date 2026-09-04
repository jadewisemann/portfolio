"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * 절이 뷰포트에 들어올 때 한 번만 올라오며 나타납니다.
 *
 * 소유권: **Motion 이 이 진입 전이의 유일한 소유자**입니다
 * (`docs/portfolio/MOTION_LANGUAGE.md` 12절 표). CSS 는 같은 요소의 `opacity` ·
 * `transform` 을 건드리지 않습니다 — 아래 두 예외만 있고, 둘 다 값을 **끄는** 쪽이라
 * 경쟁이 아니라 무력화입니다.
 *
 *   - `[data-js] [data-enter] { opacity: 0 }` — JS 가 없으면 은닉 자체가 걸리지 않아
 *     내용이 처음부터 보입니다.
 *   - `[data-motion-reduce] [data-enter] { opacity: 1 !important }` — 축소 모션에서
 *     하이드레이션을 기다리지 않고 첫 페인트부터 보입니다 (13.1절).
 *
 * 스크롤 위치의 함수로 값을 계산하지 않습니다. `whileInView` 는 교차 시점에 전이를
 * **한 번 촉발**할 뿐이므로, 12.1절이 금지한 스크럽(스크롤 오프셋에 값을 묶는 것)이
 * 아닙니다.
 *
 * 이동 거리 56px (2026-09-03, 소유자 지시 — "뒤에서 조심스럽게 올라오게"). 20px 이었고,
 * 그 거리는 「나타남」이었지 「올라옴」은 아니었습니다. 지속 시간은 그대로입니다 — 늘리면
 * 토큰(`--duration-spine`)과 문서를 함께 고쳐야 하고, 620ms 에 이 이징이면 충분히
 * 조심스럽습니다.
 *
 * 값은 `globals.css` 의 `--duration-spine`(900ms) · `--ease-spine` 과 같은 수입니다.
 * Motion 은 CSS 사용자 정의 속성을 지속 시간으로 읽지 못하므로 수를 그대로 씁니다.
 */
const SPINE_SECONDS = 0.9;
const SPINE_EASE = [0.7, 0, 0.15, 1] as const;

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** 같은 절 안에서 순서를 만들 때만 씁니다. 초 단위입니다. */
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      data-enter
      initial={{ opacity: 0, y: 72 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -8% 0px" }}
      transition={{ duration: SPINE_SECONDS, delay, ease: SPINE_EASE }}
    >
      {children}
    </motion.div>
  );
}
