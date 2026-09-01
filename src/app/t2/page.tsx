import type { Metadata } from "next";
import { CorridorCanvas } from "@/components/showcase/g1/CorridorCanvas";
import { Footer } from "@/components/showcase/g1/Footer";
import { HeroDiorama } from "@/components/showcase/g1/HeroDiorama";

export const metadata: Metadata = { title: "t2 — 종이 유지 + 실제 강조색" };

/**
 * /t2 — /g1 과 완전히 같은 컴포넌트 트리, 색만 다르다. 기하 · 레이아웃 · 상호작용은
 * 손대지 않는다. `data-tone="t2"` 하나가 전부다 — 나머지는 `globals.css` 의
 * `[data-tone="t2"]` 블록이 한다.
 *
 * 톤 근거: `globals.css` 의 /t2 주석 블록.
 */
export default function T2Page() {
  return (
    <main data-tone="t2" id="main">
      <HeroDiorama />
      <CorridorCanvas />
      <Footer />
    </main>
  );
}
