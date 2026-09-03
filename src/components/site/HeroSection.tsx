"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { SECTIONS, profile } from "@/content/site";
import { useReducedMotion } from "@/lib/motion-preference";
import { HeroBackdropMount } from "./hero-backdrop/HeroBackdropMount";
import { Reveal } from "./Reveal";
import styles from "./HeroSection.module.css";

/**
 * 첫 절(메인). 뷰포트를 이름 하나가 지배하고, 나머지는 두 문장과 숫자 세 개입니다.
 *
 * 뒤에는 3D 덩어리가 있습니다 (`hero-backdrop/`). 그것은 무엇을 설명하지 않습니다 —
 * 이름이 왼쪽에서 측정폭을 채우는 동안 오른쪽이 비어 있던 자리를 채우는 물체입니다.
 *
 * 스크롤이 이 절을 밀어내는 동안 층이 서로 다른 속도로 빠집니다: 숫자 → 문장 → 이름
 * 순으로 사라지고, 이름이 가장 오래 남습니다. 값이 스크롤의 함수이므로 되감으면
 * 되돌아옵니다.
 */
export function HeroSection() {
  const meta = SECTIONS[0];
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // 축소 모션에서는 구간을 0 으로 눌러 값이 상수가 됩니다.
  const s = reduced ? 0 : 1;
  const nameY = useTransform(scrollYProgress, [0, 1], [0, -90 * s]);
  const nameOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 1 - 1 * s]);
  const linesY = useTransform(scrollYProgress, [0, 1], [0, -150 * s]);
  const linesOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 1 - 1 * s]);
  const figuresY = useTransform(scrollYProgress, [0, 1], [0, -210 * s]);
  const figuresOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 1 - 1 * s]);

  return (
    <section
      aria-labelledby={`${meta.id}-title`}
      className={styles.hero}
      id={meta.id}
      ref={ref}
    >
      <HeroBackdropMount />

      <div className={styles.stack}>
        <Reveal className={styles.eyebrow}>
          <p className={styles.role}>{profile.role}</p>
        </Reveal>

        <motion.div
          className={styles.nameWrap}
          style={{ y: nameY, opacity: nameOpacity }}
        >
          <Reveal delay={0.06}>
            <h1 className={styles.name} id={`${meta.id}-title`}>
              {profile.name}
            </h1>
          </Reveal>
        </motion.div>

        <motion.div style={{ y: linesY, opacity: linesOpacity }}>
          <Reveal className={styles.lines} delay={0.12}>
            {profile.lines.map((line) => (
              <p className={styles.line} key={line}>
                {line}
              </p>
            ))}
          </Reveal>
        </motion.div>

        <motion.div style={{ y: figuresY, opacity: figuresOpacity }}>
          <Reveal className={styles.figuresWrap} delay={0.18}>
            <dl className={styles.figures}>
              {profile.figures.map((figure) => (
                <div className={styles.figure} key={figure.label}>
                  <dt className={styles.figureLabel}>{figure.label}</dt>
                  <dd className={styles.figureValue}>
                    <span className={styles.figureNumber}>{figure.value}</span>
                    <span className={styles.figureUnit}>{figure.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </motion.div>
      </div>
    </section>
  );
}
