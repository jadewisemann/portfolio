"use client";

import { motion, useReducedMotion } from "motion/react";
import { hero, s1 } from "@/content/golden";
import { useSceneActive } from "./useSceneActive";
import { SeamStrip } from "./SeamStrip";

/**
 * v2 — 비율이 먼저 (the ratio is the protagonist).
 *
 * 지면이 문장이 아니라 측정값으로 연다. 포지셔닝 두 문장은 작게 곁에 둔다.
 * 히어로의 거대한 `1 : 5` 가 스크롤로 S1 에 들어오면 같은 요소가 `layoutId` 로
 * S1 의 비율 라벨 자리까지 축소·이동한다 — 그 이동 자체가 히어로→프로젝트
 * 전이다. `SeamStrip` 은 그 라벨을 다시 그리지 않고(`ratioDisplay="label-only"`),
 * 대신 자기 몫의 이음선(칸 나누는 선)은 스스로 그린다 — 이 안에는 전역으로
 * 지속되는 장치가 없으므로 값 비교 자체를 대신할 것이 필요하기 때문이다.
 */
export function V2Ratio() {
  const { ref, active } = useSceneActive<HTMLDivElement>();
  const reduced = useReducedMotion();
  const scene = active ? "s1" : "hero";

  const numeral = (
    <>
      <span className="bo2-n">{s1.ratio.a}</span>
      <span aria-hidden="true" className="bo2-sep">
        :
      </span>
      <span className="bo2-n">{s1.ratio.b}</span>
    </>
  );

  return (
    <div className="bo2-root" data-scene={scene}>
      <section className="bo2-hero">
        {scene === "hero" ? (
          <motion.p
            className="bo2-hero-numeral"
            layout={!reduced}
            layoutId={reduced ? undefined : "bo2-ratio"}
            transition={{ duration: reduced ? 0 : 0.72, ease: [0.16, 1, 0.3, 1] }}
          >
            {numeral}
          </motion.p>
        ) : null}
        <p className="sr-only">
          {s1.ratio.aLabel} 대 {s1.ratio.bLabel}
        </p>

        <div className="bo2-hero-copy">
          <h1 className="bo2-hero-lines">
            {hero.lines.map((line) => (
              <span className="bo2-hero-line" key={line}>
                {line}
              </span>
            ))}
          </h1>
          <p className="bo2-standfirst">{hero.standfirst}</p>
        </div>
      </section>

      <div ref={ref}>
        <div className="bo2-s1-numeral-row">
          {scene === "s1" ? (
            <motion.p
              className="bo2-s1-numeral"
              layout={!reduced}
              layoutId={reduced ? undefined : "bo2-ratio"}
              transition={{ duration: reduced ? 0 : 0.72, ease: [0.16, 1, 0.3, 1] }}
            >
              {numeral}
            </motion.p>
          ) : null}
        </div>
        <SeamStrip
          a={s1.a}
          b={s1.b}
          drawLine
          grade={s1.grade}
          id={s1.id}
          lede={s1.lede}
          links={s1.links}
          mark={s1.mark}
          ratio={s1.ratio}
          ratioDisplay="label-only"
          title={s1.title}
        />
      </div>
    </div>
  );
}
