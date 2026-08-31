import { Hero } from "@/components/Hero";
import { MobileScene } from "@/components/spine/MobileScene";
import { SceneBlockV1 } from "@/components/spine/SpineV1";
import { hero } from "@/content/golden";
import { SPINE_SEQUENCE } from "@/lib/spine-scenes";

/**
 * /v1 — 전폭 분할 (scene-partitioned viewport).
 *
 * 개념: 뷰포트가 절마다 다시 나뉜다. `src/components/spine/SpineV1.tsx` 참고.
 * 전제(브리프 "Shared architecture"): 전폭·비율은 뷰포트 함수·척추는 정수 픽셀·
 * 라벨 하나·`clamp()` 금지·게이트 준수. 이 페이지는 컨테이너에 `max-w-*` 를 두지
 * 않습니다 — 절 자체가 100vw 이고 그 안에서 백분율이 곧 뷰포트 비율입니다.
 */
export default function V1Page() {
  return (
    <main className="min-w-0" id="main">
      <div className="px-5 md:px-10">
        <Hero lines={hero.lines} scale="display" />
        <p className="max-w-measure text-ink-2">{hero.standfirst}</p>
      </div>

      {SPINE_SEQUENCE.map((item, i) => (
        <div key={item.scene.id}>
          <SceneBlockV1
            fromPercent={i === 0 ? item.geo.percent : SPINE_SEQUENCE[i - 1].geo.percent}
            item={item}
          />
          <MobileScene item={item} />
        </div>
      ))}
    </main>
  );
}
