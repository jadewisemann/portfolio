import type { Metadata } from "next";
import { CorridorCanvas } from "@/components/showcase/g1/CorridorCanvas";
import { Footer } from "@/components/showcase/g1/Footer";
import { HeroDiorama } from "@/components/showcase/g1/HeroDiorama";

export const metadata: Metadata = { title: "g1 — 이름과 구도" };

/**
 * /g1 — 완성된 한 페이지. 첫 화면은 이름과 이미 짜인 3D 구도뿐이다(스크롤해야
 * 나타나는 빈 화면이 아니다). 스크롤하면 프로젝트마다 복도를 지나며 자리표시자
 * 프레임과 키워드 · 블러브가 나온다. 끝에는 링크가 있다.
 *
 * 상세: `src/components/showcase/g1/layout.ts`(배치 산술 · 정본),
 * `HeroDiorama.tsx`(첫 화면), `CorridorCanvas.tsx`(복도).
 */
export default function G1Page() {
  return (
    <main id="main">
      <HeroDiorama />
      <CorridorCanvas />
      <Footer />
    </main>
  );
}
