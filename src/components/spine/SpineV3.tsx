"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
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
 * /v3 — 여백이 값 (absence as the encoding).
 *
 * 정지 상태에는 그어진 선이 없습니다. 경계는 **잉크가 멈추는 자리**입니다. B 칸은
 * 문자 그대로 빈 뷰포트 `(1−비율)×100vw` 입니다 — S1·S2 처럼 두 칸 다 폭이 0 이
 * 아닌 절에서도 B 는 비웁니다(짧은 칸을 근거로 채우는 ART_DIRECTION.md 3.5 의 일반
 * 규칙을 이 절에서만 의도적으로 어깁니다 — "여백이 데이터"라는 개념이 0%·100% 의 두
 * 극단에서만 성립하면 방향이 증명되지 않기 때문입니다). B 의 뜻은 스크린리더 전용
 * 텍스트로만 남습니다 — 시각적으로는 정말 비어 있어야 합니다.
 *
 * 척추는 **재배치 중에만** 나타나는 일시적 자취입니다. 절이 바뀌는 순간 나타나 정지
 * 대역(200ms)만큼 머문 뒤 사라집니다 — 그 뒤로는 다시 아무 선도 없습니다.
 * 축소 모션에서는 "위치 정보가 사라지면 안 된다"(MOTION_LANGUAGE.md 13절)는 규칙이
 * "정지 상태엔 선이 없다"는 이 방향의 개념보다 우선합니다 — 그래서 축소 모션에서는
 * 자취가 사라지지 않고 상시 표시됩니다.
 *
 * 소유권: Motion `AnimatePresence`(opacity, SP1). 상태는 `useActiveSceneIndex`
 * (IntersectionObserver, 불리언만). `useScroll` 은 쓰지 않습니다.
 */
const HOLD_MS = 620 + 200; // 장면 간 대역 + 정지 대역 (MOTION_LANGUAGE.md 4절).

export function GhostSpineV3() {
  const activeIndex = useActiveSceneIndex(SPINE_IDS);
  const reduced = useReducedMotion();
  const width = useViewportWidth();
  // `triggered` 는 "방금 재배치가 있었다"만 추적합니다. 축소 모션의 "항상 보인다"는
  // 파생 상태(`reduced || triggered`)로 표현합니다 — effect 안에서 그 경우까지
  // setState 하면 매 렌더 직후 동기 setState 가 되어 react-hooks 가 캐스케이드
  // 렌더 위험으로 잡습니다.
  const [triggered, setTriggered] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (reduced) return;
    if (!mounted.current) {
      // 첫 마운트는 "이동"이 아니므로 자취를 만들지 않는다.
      mounted.current = true;
      return;
    }
    setTriggered(true);
    const t = setTimeout(() => setTriggered(false), HOLD_MS);
    return () => clearTimeout(t);
  }, [activeIndex, reduced]);

  const visible = reduced || triggered;
  const active = SPINE_SEQUENCE[activeIndex] ?? SPINE_SEQUENCE[0];
  const { scene, geo } = active;
  const x = spineX(geo.percent, width);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          animate={{ opacity: 1 }}
          aria-hidden="true"
          className="sp-fixed-spine sp-ghost-spine hidden md:block"
          data-edge={geo.edge ?? undefined}
          data-hard={scene.hard ? "" : undefined}
          exit={reduced ? undefined : { opacity: 0 }}
          initial={{ opacity: 0 }}
          style={{ left: x }}
          transition={{ duration: reduced ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] }}
        >
          <span aria-hidden="true" className="sp-spine-rule" />
          <div className="sp-spine-head" data-flip={geo.percent > 50 ? "" : undefined}>
            <JudgmentMark label={MARK_LABELS[scene.mark]} mark={scene.mark} />
            <RatioLabel edge={geo.edge !== null} label={geo.label} />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * 절 하나. "잉크" 칸은 실제 폭이 있는 쪽입니다 — 보통 A 지만, A 가 0% 로 사라지는
 * 절(S7)에서는 B 가 유일하게 폭을 가지므로 잉크가 됩니다. 잉크가 아닌 쪽은 항상
 * 시각적으로 완전히 비웁니다(§V3 핵심). 그 뜻은 스크린리더 전용 텍스트로만 남습니다.
 */
export function VoidSectionV3({ item }: { item: SpineSceneGeo }) {
  const { scene, geo } = item;
  const isS2 = scene.id === s2.id;
  const titleId = `${scene.id}-title`;
  // A 가 0폭이면 B 가 잉크입니다(S7). 그 외에는 A 가 잉크이고 B 는 항상 비웁니다.
  const inkSide: "a" | "b" = geo.edge === "a" ? "b" : "a";
  const inkColumn = inkSide === "a" ? scene.a : scene.b;
  const inkStruck = inkSide === "b" ? scene.struck : undefined;
  const voidColumn = inkSide === "a" ? scene.b : scene.a;
  const inkWidth = inkSide === "a" ? geo.percent : 100 - geo.percent;
  const voidWidth = 100 - inkWidth;

  return (
    <section
      aria-labelledby={titleId}
      className="sp-v3-scene hidden md:block"
      data-hard={scene.hard ? "" : undefined}
      id={scene.id}
    >
      <div className="sp-v3-head">
        <JudgmentMark label={MARK_LABELS[scene.mark]} mark={scene.mark} />
        <RatioLabel edge={geo.edge !== null} label={geo.label} />
      </div>

      <div className="sp-v3-cols" style={{ flexDirection: inkSide === "a" ? "row" : "row-reverse" }}>
        <div className="sp-v3-ink" style={{ width: `${inkWidth}%` }}>
          <h2 className="sp-title" id={titleId}>
            {scene.title}
          </h2>
          <div className="sp-lede">
            {scene.lede.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <SceneColumn column={inkColumn} struck={inkStruck} />
          {isS2 ? <RegroupTree cells={treeCells} labels={s2.toggle} /> : null}
          <div className="sp-v3-evidence">
            <EvidenceNote grade={scene.grade} gradeLabel="근거 등급" links={scene.links} />
          </div>
        </div>

        {voidWidth <= 0 ? null : (
          <div className="sp-v3-void" style={{ width: `${voidWidth}%` }}>
            {/*
              시각적으로는 정말 비어 있습니다 — 이 방향의 핵심입니다. 반대 칸의 사실과
              (있다면) 지운 문장은 스크린리더 전용 텍스트로만 존재합니다.
            */}
            <span className="sr-only">
              {voidColumn.heading}. {voidColumn.facts.join(" · ")} — 이 칸은 의도적으로 비어
              있다. 이 사이트는 관여한 만큼만 잉크로 표시한다.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
