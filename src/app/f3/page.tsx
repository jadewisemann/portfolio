import type { Metadata } from "next";
import { NameScreen } from "@/components/showcase/NameScreen";
import { CarouselShowcase } from "@/components/showcase/f3/CarouselShowcase";

export const metadata: Metadata = { title: "f3 — CSS 3D 대조군" };

/**
 * /f3 — CSS 3D 전용 대조군. WebGL 없이 `perspective` · `transform-style:
 * preserve-3d` · `translateZ` 만으로 3D 프레젠테이션을 만든다. 상세:
 * `CarouselShowcase.tsx`.
 */
export default function F3Page() {
  return (
    <main id="main">
      <NameScreen />
      <CarouselShowcase />
    </main>
  );
}
