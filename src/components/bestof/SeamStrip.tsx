import type { Grade } from "@/lib/reading";
import { seam, type Ratio } from "@/lib/seam";
import { MARKS, type Mark } from "@/lib/gutter";
import { MARK_LABELS } from "@/content/golden";
import { EvidenceNote, type EvidenceLink } from "@/components/EvidenceNote";

/**
 * Best-of-N 실험의 S1 본문. 세 안 모두 여기를 공유합니다.
 *
 * 이 실험이 겨루는 것은 **오프닝과 히어로→S1 전이**이지 S1 칸의 서식이 아닙니다
 * (SCENE_GRAPH.md 는 이미 그 서식을 확정했습니다). 그래서 칸 레이아웃은 하나만
 * 만들고, 안마다 다른 것은 이음선을 "누가 그리는가"뿐입니다.
 *
 * **정수 픽셀 · 전체 폭 정렬이 핵심입니다.** 이전 구현의 결함은 이음선이 텍스트
 * 칸 안(34rem 폭)에 갇혀 화면 폭을 관통하지 못한 것이었습니다. 그래서 이 컴포넌트는
 * 가로 패딩을 자기 자신(section)에 두지 않고 자식에게만 둡니다 — `.bo-strip-grid` 의
 * 폭이 뷰포트와 같아야 각 안의 외부 장치(고정 이음선 · 공유 요소 · 정지 헤어라인)가
 * 계산하는 퍼센트와 정확히 같은 픽셀에 떨어집니다.
 */

type Column = { heading: string; facts: readonly string[] };

export function SeamStrip({
  id,
  mark,
  title,
  lede,
  ratio,
  a,
  b,
  grade,
  gradeLabel = "근거 등급",
  links,
  drawLine = true,
  lineOnMobileOnly = false,
  ratioDisplay = "full",
}: {
  id: string;
  mark: Mark;
  title: string;
  lede: readonly string[];
  ratio: Ratio;
  a: Column;
  b: Column;
  grade: Grade;
  gradeLabel?: string;
  links: readonly EvidenceLink[];
  /** 이 칸이 스스로 선을 그리는가. 거짓이면 외부 장치(고정 이음선 등)가 그린다고 가정한다. */
  drawLine?: boolean;
  /** 참이면 768px 이상에서는 선을 그리지 않는다 — 데스크톱은 외부 장치가 대신한다. */
  lineOnMobileOnly?: boolean;
  /** "full" 은 96px 급 숫자를 여기서 그린다. "label-only" 는 공유 요소가 숫자를
   *  이미 그렸다는 뜻이므로 여기서는 분모 라벨만 텍스트로 남긴다. */
  ratioDisplay?: "full" | "label-only";
}) {
  const s = seam(ratio);

  return (
    <section aria-labelledby={`${id}-title`} className="bo-strip" id={id}>
      <div className="bo-strip-head">
        <p className="bo-strip-mark">
          <span aria-hidden="true">{MARKS[mark]}</span>
          <span className="sr-only">{MARK_LABELS[mark]}</span>
        </p>
        <h2 className="bo-strip-title" id={`${id}-title`} tabIndex={-1}>
          {title}
        </h2>
        <div className="bo-strip-lede">
          {lede.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        {ratioDisplay === "full" ? (
          <p className="bo-strip-ratio">
            <span className="bo-strip-ratio-n">
              {ratio.a} : {ratio.b}
            </span>
            <span className="bo-strip-ratio-lab">
              {ratio.aLabel} · {ratio.bLabel}
            </span>
          </p>
        ) : (
          <p className="bo-strip-ratio-lab-only">
            {ratio.aLabel} · {ratio.bLabel}
          </p>
        )}

        {s.clamped ? (
          <p className="bo-strip-clamped">
            실제 비율은 {s.actual.toFixed(1)}% 다. 칸의 최소 폭 때문에 그려진 폭은
            근사이고, 라벨이 정본이다.
          </p>
        ) : null}
      </div>

      <div
        className="bo-strip-grid"
        data-draw-line={drawLine ? "" : undefined}
        data-line-mobile-only={lineOnMobileOnly ? "" : undefined}
        style={
          {
            "--bo-pct": `${s.percent}%`,
            "--bo-an": String(s.percent / 100),
          } as React.CSSProperties
        }
      >
        <div className="bo-strip-col">
          <h3>{a.heading}</h3>
          <ul>
            {a.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <div aria-hidden="true" className="bo-strip-gap" />
        <div className="bo-strip-col">
          <h3>{b.heading}</h3>
          <ul>
            {b.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bo-strip-evidence">
        <EvidenceNote grade={grade} gradeLabel={gradeLabel} links={links} />
      </div>
    </section>
  );
}
