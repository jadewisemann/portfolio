import { Hero } from "@/components/Hero";
import { MobileScene } from "@/components/spine/MobileScene";
import { FixedSpineV2, SectionV2 } from "@/components/spine/SpineV2";
import { hero } from "@/content/golden";
import { SPINE_SEQUENCE } from "@/lib/spine-scenes";

/**
 * /v2 — 고정 척추 · 흐르는 지면 (persistent fixed instrument).
 *
 * 개념: 척추는 `position: fixed` 로 하나만 존재하고 현재 절의 참값 위에 늘 있다.
 * 절은 뷰포트 높이로 강제되지 않고 보통 문서처럼 흐른다.
 * `src/components/spine/SpineV2.tsx` 참고.
 */
export default function V2Page() {
  return (
    <main className="min-w-0" id="main">
      <FixedSpineV2 />

      <div className="px-5 md:px-10">
        <Hero lines={hero.lines} scale="display" />
        <p className="max-w-measure text-ink-2">{hero.standfirst}</p>
      </div>

      {SPINE_SEQUENCE.map((item) => (
        <div key={item.scene.id}>
          <SectionV2 item={item} />
          <MobileScene item={item} />
        </div>
      ))}
    </main>
  );
}
