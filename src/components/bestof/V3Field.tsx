import { hero, s1 } from "@/content/golden";
import { seam } from "@/lib/seam";
import { SeamStrip } from "./SeamStrip";

/**
 * v3 — 여백의 압력 (asymmetric field / silence).
 *
 * 변수는 구성과 여백이다. 히어로는 텍스트를 좁은 16.667% 칸에 밀어 넣고 나머지
 * 83.333% 는 비워 둔다 — 그 비례가 이미 S1 의 실측 비율(FE 1 : 그 외 5)과 같다.
 * 전고 헤어라인 하나가 정확히 그 경계에서 한 번도 움직이지 않고 히어로에서
 * S1 까지 이어진다.
 *
 * 이 안에는 스크롤에 반응하는 상태가 하나도 없다 — 관찰자도, 재배치도, 밝기
 * 전환도 없다. MOTION_LANGUAGE.md 12.1의 2번("뷰포트 진입 시 절 페이드인")을
 * 범하지 않으려면 그렇게 해야 했다: 침묵이 장치라면, 그 장치는 스스로도
 * 침묵해야 사실과 어긋나지 않는다. 전이의 "순간"이 없다는 것이 이 안의
 * 가장 큰 약점이다 — 심사에서 스스로 밝힌다.
 */
export function V3Field() {
  const s1Percent = seam(s1.ratio).percent;

  return (
    <div
      className="bo3-root"
      style={{ "--bo3-pos": `${s1Percent}%` } as React.CSSProperties}
    >
      <div aria-hidden="true" className="bo3-hairline" />

      <section className="bo3-hero">
        <div className="bo3-hero-text">
          <h1 className="bo3-hero-lines">
            {hero.lines.map((line) => (
              <span className="bo3-hero-line" key={line}>
                {line}
              </span>
            ))}
          </h1>
          <p className="bo3-standfirst">{hero.standfirst}</p>
        </div>
      </section>

      <SeamStrip
        a={s1.a}
        b={s1.b}
        drawLine={false}
        grade={s1.grade}
        id={s1.id}
        lede={s1.lede}
        links={s1.links}
        mark={s1.mark}
        ratio={s1.ratio}
        title={s1.title}
      />
    </div>
  );
}
