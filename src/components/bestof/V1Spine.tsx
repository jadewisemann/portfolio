"use client";

import { motion, useReducedMotion } from "motion/react";
import { hero, s1 } from "@/content/golden";
import { seam } from "@/lib/seam";
import { useSceneActive } from "./useSceneActive";
import { SeamStrip } from "./SeamStrip";

/**
 * v1 — 척추 (spine as architecture).
 *
 * 이음선이 첫 프레임부터 존재하는 전폭 · 전고 수직선입니다. 히어로에서는
 * 아직 비교할 사실이 없으므로 50%(미정 · 대칭)에 정지합니다. S1 이 뷰포트에
 * 들어오면 그 절의 실측 비율(FE 1 : 그 외 5 → 16.667%)로 자리를 옮깁니다 —
 * 값에서 값으로 이동하는 것이지 장식이 움직이는 것이 아닙니다.
 *
 * 데스크톱 전용 장치입니다. 768px 미만에서는 고정 수직선이 각 절의 로컬 비율과
 * 맞아떨어지지 않으므로(뷰포트 기준 위치가 스크롤에 따라 절의 실제 블록과
 * 어긋난다) 끕니다 — 대신 `SeamStrip` 자신의 모바일 서식(기존에 합의된
 * 참조 블록 방식)이 절을 나릅니다. 이것이 이 안의 가장 큰 약점입니다.
 */
export function V1Spine() {
  const { ref, active } = useSceneActive<HTMLDivElement>();
  const reduced = useReducedMotion();
  const scene = active ? "s1" : "hero";
  const s1Percent = seam(s1.ratio).percent;

  return (
    <div
      className="bo1-root"
      data-scene={scene}
      style={{ "--bo1-s1-pos": `${s1Percent}%` } as React.CSSProperties}
    >
      <motion.div
        aria-hidden="true"
        className="bo1-spine"
        layout={!reduced}
        transition={{
          duration: reduced ? 0 : 0.72,
          ease: [0.16, 1, 0.3, 1],
        }}
      />

      <section className="bo1-hero">
        <div aria-hidden="true" className="bo1-hero-rule" />
        <h1 className="bo1-hero-lines">
          {hero.lines.map((line) => (
            <span className="bo1-hero-line" key={line}>
              {line}
            </span>
          ))}
        </h1>
        <p className="bo1-standfirst">{hero.standfirst}</p>
      </section>

      <div ref={ref}>
        <SeamStrip
          a={s1.a}
          b={s1.b}
          drawLine
          grade={s1.grade}
          id={s1.id}
          lede={s1.lede}
          lineOnMobileOnly
          links={s1.links}
          mark={s1.mark}
          ratio={s1.ratio}
          title={s1.title}
        />
      </div>
    </div>
  );
}
