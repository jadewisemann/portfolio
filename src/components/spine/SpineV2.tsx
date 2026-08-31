"use client";

import { motion, useReducedMotion } from "motion/react";
import { EvidenceNote } from "@/components/EvidenceNote";
import { MARK_LABELS, s2, treeCells } from "@/content/golden";
import { spineX } from "@/lib/spine";
import { useActiveSceneIndex, useViewportWidth } from "@/lib/useSpineState";
import { SPINE_IDS, SPINE_SEQUENCE, type SpineSceneGeo } from "@/lib/spine-scenes";
import { JudgmentMark } from "./JudgmentMark";
import { RatioLabel } from "./RatioLabel";
import { RegroupTree } from "./RegroupTree";
import { SceneColumn } from "./SceneColumn";

/**
 * /v2 — 고정 척추 · 흐르는 지면 (persistent fixed instrument).
 *
 * 척추는 `position: fixed`, 뷰포트 전체 높이이고 **항상 현재 절의 비율 위**에 있습니다.
 * 절 블록은 뷰포트 높이로 강제되지 않고 문서가 보통 흐르듯 흐릅니다 — 페이지에는
 * 절마다 자기 비율을 그대로 보여주는 **정적** 칸 분할이 있고(색·이동 없음, 그 절이
 * "참값"이라는 사실 그 자체), 그 위에 이 계기판 하나가 겹쳐 "지금 어디를 보고 있는가"
 * 를 항상 알려줍니다.
 *
 * 비율 라벨은 뷰포트 가장자리(계기판의 머리)에 고정되어 있어 스크롤과 무관하게 항상
 * 화면에 있습니다 — 씬 가구가 아니라 **계기판**입니다.
 *
 * 소유권: Motion `animate` (SP1). 상태는 `useActiveSceneIndex`(IntersectionObserver,
 * 불리언만) 가 만들고, 보간(620ms, `--ease-spine`)은 Motion 이 합니다. `useScroll`은
 * 쓰지 않습니다 — 절 사이의 **이산** 전환입니다. 위치는 `spineX()` 로 반올림한 정수
 * px 이고 `useViewportWidth()` 가 리사이즈를 처리합니다.
 */
export function FixedSpineV2() {
  const activeIndex = useActiveSceneIndex(SPINE_IDS);
  const reduced = useReducedMotion();
  const width = useViewportWidth();
  const active = SPINE_SEQUENCE[activeIndex] ?? SPINE_SEQUENCE[0];
  const { scene, geo } = active;
  const x = spineX(geo.percent, width);

  return (
    <motion.div
      animate={{ left: x }}
      aria-hidden="true"
      className="sp-fixed-spine hidden md:block"
      data-edge={geo.edge ?? undefined}
      data-hard={scene.hard ? "" : undefined}
      style={reduced ? { left: x } : undefined}
      transition={{ duration: reduced ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] }}
    >
      <span aria-hidden="true" className="sp-spine-rule" />
      <div className="sp-spine-head" data-flip={geo.percent > 50 ? "" : undefined}>
        <JudgmentMark label={MARK_LABELS[scene.mark]} mark={scene.mark} />
        <RatioLabel edge={geo.edge !== null} label={geo.label} />
      </div>
    </motion.div>
  );
}

/**
 * 흐르는 절 하나. 정적 칸 분할(자기 비율)을 보여주고, 그 절이 뷰포트에 걸려 있는 동안
 * 위 `FixedSpineV2` 가 같은 위치로 이동해 옵니다. 이 컴포넌트 자체는 모션을 소유하지
 * 않습니다 — 색·이동 없는 정적 경계선입니다.
 */
export function SectionV2({ item }: { item: SpineSceneGeo }) {
  const { scene, geo } = item;
  const isS2 = scene.id === s2.id;

  return (
    <section
      aria-labelledby={`${scene.id}-title`}
      className="sp-v2-scene hidden md:block"
      data-hard={scene.hard ? "" : undefined}
      id={scene.id}
    >
      {/* 칸을 제목·논지보다 먼저 둡니다 — SpineV1.tsx 와 같은 이유(1440·1920 첫 뷰포트
          오른쪽의 무잉크 재발 방지)입니다. */}
      <div className="sp-v2-cols" data-edge={geo.edge ?? undefined}>
        {geo.edge === "a" ? null : (
          <div
            className="sp-col sp-col-a sp-v2-static-a"
            data-hard={scene.hard ? "" : undefined}
            style={{ width: `${geo.percent}%` }}
          >
            <SceneColumn column={scene.a} />
          </div>
        )}
        {geo.edge === "b" ? null : (
          <div className="sp-col sp-col-b" style={{ width: `${100 - geo.percent}%` }}>
            <SceneColumn column={scene.b} struck={scene.struck} />
          </div>
        )}
      </div>

      <div className="sp-v2-body">
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
        <div className="sp-v2-signature">
          <RegroupTree cells={treeCells} labels={s2.toggle} />
        </div>
      ) : null}

      <div className="sp-v2-evidence">
        <EvidenceNote grade={scene.grade} gradeLabel="근거 등급" links={scene.links} />
      </div>
    </section>
  );
}
