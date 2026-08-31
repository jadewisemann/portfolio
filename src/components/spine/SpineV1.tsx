"use client";

import { motion, useReducedMotion } from "motion/react";
import { EvidenceNote } from "@/components/EvidenceNote";
import { MARK_LABELS, s2, treeCells } from "@/content/golden";
import { spineX } from "@/lib/spine";
import type { SpineSceneGeo } from "@/lib/spine-scenes";
import { useViewportWidth } from "@/lib/useSpineState";
import { JudgmentMark } from "./JudgmentMark";
import { RatioLabel } from "./RatioLabel";
import { RegroupTree } from "./RegroupTree";
import { SceneColumn } from "./SceneColumn";

/**
 * /v1 — 전폭 분할 (scene-partitioned viewport).
 *
 * 절마다 뷰포트 전체 높이 블록이고, 척추는 그 블록의 전체 높이를 지나는 수직선입니다.
 * 위치는 `left: {percent}%` — 블록 자체가 `100vw` 이므로 백분율이 곧 뷰포트 폭의
 * 함수입니다 (밴드가 아니라 뷰포트를 나눕니다, ART_DIRECTION.md 3.3).
 *
 * 절의 진입마다 척추가 **이전 절의 참값에서 이번 절의 참값으로 점프**합니다. 그 자리는
 * 이 절이 뷰포트에 들어오는 순간(Motion `whileInView`, 내부적으로 IntersectionObserver)
 * 이고, 지속 시간은 우리가 소유합니다(620ms, `--ease-spine`, 장면 간 대역).
 * `useScroll`/`scrollYProgress` 는 쓰지 않습니다 — 절이 연속으로 보간되지 않습니다.
 *
 * 소유권: Motion `initial`/`whileInView` (SP1, MOTION_LANGUAGE.md 12절). 애니메이션
 * 대상은 `left`(정수 px) 이고, `src/lib/spine.ts` 의 `spineX()` 로 반올림합니다 —
 * 소수점 좌표는 1px 선이 두 픽셀에 걸쳐 번집니다(DESIGN_SYSTEM.md 6절과 같은 이유).
 * `useViewportWidth()` 가 리사이즈를 처리합니다("Handle resize" 요구사항).
 */
export function SceneBlockV1({
  item,
  fromPercent,
}: {
  item: SpineSceneGeo;
  /** 이전 절의 참값(%). 첫 절이면 자기 값과 같아 점프하지 않습니다. */
  fromPercent: number;
}) {
  const { scene, geo } = item;
  const reduced = useReducedMotion();
  const isS2 = scene.id === s2.id;
  const width = useViewportWidth();
  const fromX = spineX(fromPercent, width);
  const toX = spineX(geo.percent, width);

  return (
    <section
      aria-labelledby={`${scene.id}-title`}
      className="sp-v1-scene hidden md:block"
      data-edge={geo.edge ?? undefined}
      data-hard={scene.hard ? "" : undefined}
      id={scene.id}
    >
      <motion.div
        className="sp-spine"
        data-edge={geo.edge ?? undefined}
        data-hard={scene.hard ? "" : undefined}
        initial={reduced ? false : { left: fromX }}
        style={reduced ? { left: toX } : undefined}
        transition={{ duration: reduced ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, amount: 0.5 }}
        whileInView={{ left: toX }}
      >
        <span aria-hidden="true" className="sp-spine-rule" />
        <div className="sp-spine-head" data-flip={geo.percent > 50 ? "" : undefined}>
          <JudgmentMark label={MARK_LABELS[scene.mark]} mark={scene.mark} />
          <RatioLabel edge={geo.edge !== null} label={geo.label} />
        </div>
      </motion.div>

      {/*
        칸을 척추 머리 바로 아래, 제목·논지보다 먼저 둡니다. 처음에는 제목+논지를
        위에 두었는데 — 34rem 측정폭 산문이 왼쪽에만 있어 1440·1920 첫 뷰포트의
        오른쪽 3분의 1이 그대로 비었습니다(칸 행이 스크롤해야 보이는 위치였기
        때문입니다). 실측 뒤 순서를 바꿨습니다 — 이 사이트가 실측으로 잡은 바로 그
        결함(58.3% 무잉크)을 새 구조에서 재발시키지 않기 위해서입니다.
      */}
      <div className="sp-v1-cols">
        {geo.edge === "a" ? null : (
          <div className="sp-col sp-col-a" style={{ width: `${geo.percent}%` }}>
            <SceneColumn column={scene.a} />
          </div>
        )}
        {geo.edge === "b" ? null : (
          <div className="sp-col sp-col-b" style={{ width: `${100 - geo.percent}%` }}>
            <SceneColumn column={scene.b} struck={scene.struck} />
          </div>
        )}
      </div>

      <div className="sp-v1-body">
        <h2 className="sp-title" id={`${scene.id}-title`}>
          {scene.title}
        </h2>
        <div className="sp-lede">
          {scene.lede.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>

      {isS2 ? (
        <div className="sp-v1-signature">
          <RegroupTree cells={treeCells} labels={s2.toggle} />
        </div>
      ) : null}

      <div className="sp-v1-evidence">
        <EvidenceNote grade={scene.grade} gradeLabel="근거 등급" links={scene.links} />
      </div>
    </section>
  );
}
