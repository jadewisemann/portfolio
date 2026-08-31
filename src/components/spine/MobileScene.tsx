import { EvidenceNote } from "@/components/EvidenceNote";
import { MARK_LABELS, s2, treeCells } from "@/content/golden";
import type { SpineSceneGeo } from "@/lib/spine-scenes";
import { JudgmentMark } from "./JudgmentMark";
import { RatioLabel } from "./RatioLabel";
import { RegroupTree } from "./RegroupTree";
import { SceneColumn } from "./SceneColumn";

/**
 * 모바일(< 768px) 절 렌더러. **v1·v2·v3 세 경로에서 동일합니다** — 공간 모델의 차이는
 * 데스크톱 전용이고, 모바일 전략은 브리프의 "공유 아키텍처" 항목이 이미 확정했습니다
 * (이음선 수평선·축 교체, ART_DIRECTION.md 5절 개정).
 *
 * 블록의 HEIGHT 비율이 그 절의 비율입니다. **최소 블록 높이**를 콘텐츠 길이가 아니라
 * `TOTAL`(28px 리듬의 배수)에서 파생합니다 — `a = round(percent/100 * TOTAL)`,
 * `b = TOTAL - a` 이므로 `a / (a+b)` 는 항상 정확히 `percent` 와 같습니다(반올림 오차
 * 이하). 콘텐츠 길이가 비율을 결정하던 iteration 0 의 결함
 * (S1: colA.h=260·colB.h=328 인데 비율은 1:5, ART_DIRECTION.md 5절)의 재발 방지입니다.
 *
 * 678px 를 320px 폭 화면에서 이동시키지 않습니다 — 시그니처 트리는 폭 방향 재배치가
 * 아니라 **각 칩의 제자리 재묶음**(layout="position")이므로 이동 거리가 칩 하나 크기를
 * 넘지 않습니다.
 */
const TOTAL = 616; // 22 × 28 — 수직 리듬의 배수.

function blockHeights(percent: number, edge: "a" | "b" | null) {
  if (edge === "a") return { a: 0, b: TOTAL };
  if (edge === "b") return { a: TOTAL, b: 0 };
  const a = Math.round((percent / 100) * TOTAL);
  return { a, b: TOTAL - a };
}

export function MobileScene({ item }: { item: SpineSceneGeo }) {
  const { scene, geo } = item;
  const heights = blockHeights(geo.percent, geo.edge);
  const isS2 = scene.id === s2.id;

  return (
    <section
      aria-labelledby={`${scene.id}-m-title`}
      className="sp-mobile-scene md:hidden"
      data-edge={geo.edge ?? undefined}
      data-hard={scene.hard ? "" : undefined}
      // 실측 도구용 메타데이터입니다(시각·접근성에 영향 없음) — review/hero-bestof 의
      // 캡처 스크립트가 320px 에서 colA.h/(colA.h+colB.h) 가 이 값과 ±2%p 안에
      // 드는지 기하로 판정합니다(브리프 "Assert it").
      data-percent={geo.percent}
      id={`${scene.id}-m`}
    >
      <div className="sp-mobile-head">
        <JudgmentMark label={MARK_LABELS[scene.mark]} mark={scene.mark} />
        <RatioLabel edge={geo.edge !== null} label={geo.label} />
      </div>

      <h2 className="sp-title" id={`${scene.id}-m-title`}>
        {scene.title}
      </h2>
      <div className="sp-lede">
        {scene.lede.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <div className="sp-mobile-blocks">
        {geo.edge === "a" ? null : (
          <div className="sp-mobile-block sp-mobile-a" style={{ height: heights.a }}>
            <SceneColumn column={scene.a} />
          </div>
        )}
        {geo.edge === null ? (
          <div
            aria-hidden="true"
            className="sp-mobile-line"
            data-hard={scene.hard ? "" : undefined}
          />
        ) : null}
        {geo.edge === "b" ? null : (
          <div className="sp-mobile-block sp-mobile-b" style={{ height: heights.b }}>
            <SceneColumn column={scene.b} struck={scene.struck} />
          </div>
        )}
      </div>

      {isS2 ? <RegroupTree cells={treeCells} labels={s2.toggle} /> : null}

      <div className="sp-evidence">
        <EvidenceNote grade={scene.grade} gradeLabel="근거 등급" links={scene.links} />
      </div>
    </section>
  );
}
