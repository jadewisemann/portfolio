import { DirTree } from "@/components/DirTree";
import { GutterRail, type RailItem } from "@/components/Gutter";
import { Hero } from "@/components/Hero";
import { Seam } from "@/components/Seam";
import { MARKS } from "@/lib/gutter";
import { MARK_LABELS, hero, s1, s2, treeCells } from "@/content/golden";

/*
  골든 슬라이스 = S0 + S1 + S2 (SCENE_GRAPH.md 1절).
  S3~S13 은 EXPAND_SCENES 로 넘깁니다. 게이트를 통과하기 전에 확장하지 않습니다.

  문구와 값은 src/content/golden.ts 에 있고, 그 원장은 docs/portfolio/CONTENT.md 에서
  왔습니다. 여기서 사실을 만들지 않습니다.
*/

const rail: readonly RailItem[] = [
  { id: s1.id, mark: s1.mark, markLabel: MARK_LABELS[s1.mark], title: s1.title },
  { id: s2.id, mark: s2.mark, markLabel: MARK_LABELS[s2.mark], title: s2.title },
];

/** 이 지면에 실제로 쓰인 기호만 범례에 넣습니다. 쓰지 않은 어휘를 전시하지 않습니다. */
const legend = ["confirmed", s1.mark, s2.mark] as const;

export default function Home() {
  return (
    <div className="mx-auto flex max-w-[76rem] gap-8 px-5">
      <GutterRail
        items={rail}
        label="판단 기호"
        restingLabel={MARK_LABELS.confirmed}
        restingMark="confirmed"
      />

      <main className="min-w-0 flex-1 pb-28" id="main">
        <Hero lines={hero.lines} />

        <p className="max-w-measure text-ink-2">{hero.standfirst}</p>

        {/* 기호 범례. 거터 레일의 어휘를 처음 보는 독자를 위한 것입니다. */}
        <dl className="mt-7 flex flex-wrap gap-x-6 gap-y-1 font-mono text-note leading-5 text-ink-3">
          {legend.map((mark) => (
            <div className="flex gap-2" key={mark}>
              <dt aria-hidden="true">{MARKS[mark]}</dt>
              <dd>{MARK_LABELS[mark]}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-14 space-y-14">
          <Seam
            grade={s1.grade}
            gradeLabel="근거 등급"
            id={s1.id}
            a={s1.a}
            lede={s1.lede}
            b={s1.b}
            links={s1.links}
            mark={s1.mark}
            markLabel={MARK_LABELS[s1.mark]}
            ratio={s1.ratio}
            title={s1.title}
          />

          <Seam
            footer={
              <>
                <DirTree cells={treeCells} labels={s2.toggle} />

                <p className="mt-7 max-w-measure font-mono text-note leading-5 text-ink-3">
                  {s2.commit}
                </p>

                {/* 줄인 것과 유예한 것을 조용히 두지 않습니다 (BRIEF.md 5.1). */}
                <ul className="mt-4 max-w-measure space-y-2 font-mono text-note leading-5 text-ink-3">
                  {s2.disclosure.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </>
            }
            grade={s2.grade}
            gradeLabel="근거 등급"
            id={s2.id}
            a={s2.a}
            lede={s2.lede}
            b={s2.b}
            links={s2.links}
            mark={s2.mark}
            markLabel={MARK_LABELS[s2.mark]}
            ratio={s2.ratio}
            title={s2.title}
          />
        </div>
      </main>
    </div>
  );
}
