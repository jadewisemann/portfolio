"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useReducedMotion } from "@/lib/motion-preference";
import styles from "./ScrollProgress.module.css";

/**
 * 문서 맨 위의 1px 진행 막대. 상단 막대의 아래 테두리 위에 겹쳐 그립니다.
 *
 * 스프링을 한 겹 얹는 이유: 스크롤 값을 그대로 쓰면 휠의 계단이 그대로 보입니다.
 * Lenis 의 관성과 같은 성격으로 눌러 주어야 막대가 지면과 함께 움직입니다.
 * 축소 모션에서는 스프링 없이 스크롤 값을 바로 씁니다 — 정보는 남고 관성만 사라집니다.
 */
export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 32,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className={styles.bar}
      style={{ scaleX: reduced ? scrollYProgress : smooth }}
    />
  );
}
