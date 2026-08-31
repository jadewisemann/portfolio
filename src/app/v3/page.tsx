import { Hero } from "@/components/Hero";
import { MobileScene } from "@/components/spine/MobileScene";
import { GhostSpineV3, VoidSectionV3 } from "@/components/spine/SpineV3";
import { hero } from "@/content/golden";
import { SPINE_SEQUENCE } from "@/lib/spine-scenes";

/**
 * /v3 — 여백이 값 (absence as the encoding).
 *
 * 개념: 정지 상태엔 그어진 선이 없다. 경계는 잉크가 멈추는 자리다. 척추는 재배치
 * 중에만 나타나는 일시적 자취다. `src/components/spine/SpineV3.tsx` 참고.
 */
export default function V3Page() {
  return (
    <main className="min-w-0" id="main">
      <GhostSpineV3 />

      <div className="px-5 md:px-10">
        <Hero lines={hero.lines} scale="display" />
        <p className="max-w-measure text-ink-2">{hero.standfirst}</p>
      </div>

      {SPINE_SEQUENCE.map((item) => (
        <div key={item.scene.id}>
          <VoidSectionV3 item={item} />
          <MobileScene item={item} />
        </div>
      ))}
    </main>
  );
}
