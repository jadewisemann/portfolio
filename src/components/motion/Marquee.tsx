"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useReducedMotion } from "@/lib/motion-preference";
import styles from "./Marquee.module.css";

/**
 * 스크롤을 따라 옆으로 흐르는 띠.
 *
 * **스스로 도는 무한 루프가 아닙니다.** 위치가 스크롤의 함수이므로 멈추면 멈추고
 * 되감으면 되돌아옵니다 — 읽는 사람이 속도를 쥐고 있습니다. 무한 루프는 시선을
 * 계속 끌어당기는데, 이 띠는 절과 절 사이의 숨이지 볼거리가 아닙니다.
 *
 * 항목을 두 벌 깔고 한 벌 길이 안에서만 움직이므로 오른쪽 끝이 비지 않습니다.
 * 둘째 벌은 같은 내용을 다시 읽히지 않도록 보조 기술에서 숨깁니다.
 */
export interface MarqueeProps {
  items: readonly string[];
  /** 스크롤 전 구간에서 이동하는 거리. 한 벌 길이에 대한 비율입니다. */
  travel?: number;
  direction?: 1 | -1;
}

export function Marquee({ items, travel = 0.5, direction = -1 }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const distance = reduced ? 0 : travel * direction * 100;
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `${distance}%`]);

  return (
    <div className={styles.viewport} ref={ref}>
      <motion.div className={styles.track} style={{ x }}>
        <ul className={styles.row}>
          {items.map((item) => (
            <li className={styles.item} key={item}>
              {item}
            </li>
          ))}
        </ul>
        <ul aria-hidden="true" className={styles.row}>
          {items.map((item) => (
            <li className={styles.item} key={item}>
              {item}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
