import type { Metadata } from "next";
import { GalleryCanvas } from "@/components/showcase/f1/GalleryCanvas";
import { NameScreen } from "@/components/showcase/NameScreen";

export const metadata: Metadata = { title: "f1 — 평면 갤러리" };

/**
 * /f1 — 평면 갤러리. 스크린샷 평면이 3D 공간에 깊이를 달리해 떠 있고, 포인터
 * 시차와 스크롤이 카메라를 그 사이로 통과시킨다. 상세: `GalleryScene.tsx`.
 */
export default function F1Page() {
  return (
    <main id="main">
      <NameScreen />
      <GalleryCanvas />
    </main>
  );
}
