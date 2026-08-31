import { MARKS, type Mark } from "@/lib/gutter";
import { seam as computeSeam, type Ratio } from "@/lib/seam";
import { EvidenceNote, type EvidenceLink } from "./EvidenceNote";
import type { Grade } from "@/lib/reading";

/**
 * 이음선 절. 이 사이트의 유일한 구조 장치입니다 (ART_DIRECTION.md 3.3).
 *
 * **이음선의 위치가 그 절의 수치입니다.** 장식이 아니라 값이므로:
 *   - 위치는 `src/lib/seam.ts` 가 계산하고 단위 테스트가 지킵니다.
 *   - 폭이 최소 폭 보호에 걸려 실제 비율과 어긋나면 화면에 그 사실을 밝힙니다.
 *     라벨이 정본이고 폭은 근사입니다 (ART_DIRECTION.md 3.4).
 *
 * 모션 소유자: 없음. **정적입니다** (MOTION_LANGUAGE.md 12절 SE1).
 *
 * ## 왜 산문이 이음선 위에 있나 (렌더해 보고 고친 구조)
 *
 * 처음에는 두 칸에 각자의 산문을 넣었습니다. 1440 렌더에서 두 번 무너졌습니다:
 *   - 1 : 5 (16.7%) 칸에서 한 줄에 한글 10자가 들어가 문단 높이가 231px 이 되었고,
 *   - 7 : 1 (12.5%) 칸에서 근거 경로가 네 줄로 부서졌습니다.
 * 좁은 칸의 산문을 아래로 내리는 규칙을 넣어 봤지만 같은 제목이 두 번 나왔습니다.
 *
 * 그래서 역할을 나눴습니다: **논지는 이음선 위에서 전폭으로, 두 칸은 상태의 이름과
 * 짧은 사실만.** 두 칸은 어떤 비율에서도 같은 조판(등폭)이므로 3.5 의 「한쪽을 각주로
 * 만들지 않는다」가 12% 에서도 성립합니다. 근거는 절의 오른쪽 아래에 한 번 놓입니다.
 */

/** 칸의 내용. 어떤 비율에서도 부서지지 않는 것만 담습니다. */
export type SeamColumn = {
  /** 상태의 이름. */
  heading: string;
  /** 등폭으로 조판할 짧은 사실. 경로 · 명령 · 수치. */
  facts: readonly string[];
};

function ColumnBody({ column }: { column: SeamColumn }) {
  return (
    <div>
      <h3 className="font-mono text-mono leading-mono text-ink-2">
        {column.heading}
      </h3>
      <ul className="mt-2 space-y-1 font-mono text-note leading-5 text-ink-3">
        {column.facts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
    </div>
  );
}

export function Seam({
  id,
  mark,
  markLabel,
  title,
  lede,
  ratio,
  hard,
  a,
  b,
  grade,
  gradeLabel,
  links,
  footer,
}: {
  id: string;
  mark: Mark;
  /** 기호의 뜻. 기호 글리프는 aria-hidden 이므로 이것이 접근 가능한 이름을 만듭니다. */
  markLabel: string;
  title: string;
  /** 논지. 이음선 위에서 전폭으로 조판합니다. */
  lede: readonly string[];
  ratio: Ratio;
  /** 되돌릴 수 없는 경계인가. 참이면 2px (ART_DIRECTION.md 3.3). */
  hard?: boolean;
  a: SeamColumn;
  b: SeamColumn;
  grade: Grade;
  gradeLabel: string;
  links: readonly EvidenceLink[];
  /** 절 아래에 붙는 밝힘. 줄인 것·유예한 것을 조용히 두지 않습니다. */
  footer?: React.ReactNode;
}) {
  const s = computeSeam(ratio);

  return (
    <section
      aria-labelledby={`${id}-mark ${id}-title`}
      // 거터가 이 속성을 읽어 현재 기호를 정합니다 (Gutter.tsx).
      data-mark={mark}
      id={id}
      // 모바일 거터: 3px 왼쪽 경계선 + 인라인 기호 (ART_DIRECTION.md 3.17).
      className="border-l-[3px] border-t border-rule pl-4 pt-7 md:border-l-0 md:flex md:gap-8 md:pl-0"
    >
      <p className="w-gutter shrink-0 font-mono text-mark leading-mono text-ink-3 md:text-right">
        <span aria-hidden="true">{MARKS[mark]}</span>
        <span className="sr-only" id={`${id}-mark`}>
          {markLabel}
        </span>
      </p>

      <div className="min-w-0 flex-1">
        <h2
          className="max-w-measure font-semibold leading-[1.5] text-decision"
          id={`${id}-title`}
          tabIndex={-1}
        >
          {title}
        </h2>

        <div className="mt-6 max-w-measure space-y-4">
          {lede.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div
          className="seam"
          data-edge={s.edge ?? undefined}
          data-hard={hard ? "" : undefined}
          style={
            {
              "--seam-a": `${s.percent}%`,
              "--seam-an": String(s.percent / 100),
            } as React.CSSProperties
          }
        >
          {/*
            비율 띠. 같은 값을 두 번, 다른 크기로 말합니다 — 수는 96px, 띠는 전폭.
            모바일에서는 두 칸의 높이가 콘텐츠 길이에 종속되어 비율이 묻히므로,
            좁은 폭에서 비율을 읽을 수 있는 것은 이 띠뿐입니다.
          */}
          <div aria-hidden="true" className="seam-band">
            <span />
          </div>

          {/*
            비율 라벨. 지면에서 가장 큰 글자이고, 두 수가 이음선을 양쪽에서 끼웁니다.
            라벨을 선 위에 겹쳐 놓지 않는 이유: 0% 절에서 가운데 정렬 보정이
            뷰포트 밖으로 나가 가로 넘침을 만듭니다 (e2e/geometry.spec.ts 가 잡습니다).

            한쪽 칸이 사라지는 절에서는 두 수를 한 줄에 모읍니다 — 0폭 칸에 96px 활자를
            넣을 수 없고, 그렇다고 수를 지우면 분모가 사라집니다.
          */}
          {s.edge === null ? (
            <>
              <p className="seam-num seam-num-a">
                <span className="seam-n">{ratio.a}</span>
                <span className="seam-lab">{ratio.aLabel}</span>
              </p>
              <p className="seam-num seam-num-b">
                <span className="seam-n">{ratio.b}</span>
                <span className="seam-lab">{ratio.bLabel}</span>
              </p>
            </>
          ) : (
            <p className="seam-num">
              <span className="seam-n">
                {ratio.a} : {ratio.b}
              </span>
              <span className="seam-lab">
                {ratio.aLabel} : {ratio.bLabel}
              </span>
            </p>
          )}

          {s.edge === "a" ? null : (
            <div className="seam-col seam-col-a">
              <ColumnBody column={a} />
            </div>
          )}

          {/*
            경계. 1px 또는 2px. 색이 아니라 두께가 의미를 나릅니다.
            칸이 사라지는 절에서는 이 요소를 만들지 않습니다 — 경계가 컨테이너의
            테두리 자체가 되기 때문입니다 (globals.css `.seam[data-edge]`).
          */}
          {s.edge === null ? (
            <div aria-hidden="true" className="seam-line" />
          ) : null}

          {s.edge === "b" ? null : (
            <div className="seam-col seam-col-b">
              <ColumnBody column={b} />
            </div>
          )}
        </div>

        {s.clamped ? (
          <p className="mt-4 max-w-measure font-mono text-note leading-5 text-ink-3">
            실제 비율은 {s.actual.toFixed(1)}% 다. 칸의 최소 폭 때문에 그려진 폭은
            근사이고, 라벨이 정본이다.
          </p>
        ) : null}

        {/* 근거는 절의 오른쪽 아래에 한 번 놓입니다 (ART_DIRECTION.md 3.15). */}
        <div className="mt-7 flex justify-end border-t border-rule pt-3">
          <EvidenceNote grade={grade} gradeLabel={gradeLabel} links={links} />
        </div>

        {footer}
      </div>
    </section>
  );
}
