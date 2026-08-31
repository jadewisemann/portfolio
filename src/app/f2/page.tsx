import type { Metadata } from "next";
import { NameScreen } from "@/components/showcase/NameScreen";
import { StackShowcase } from "@/components/showcase/f2/StackShowcase";

export const metadata: Metadata = { title: "f2 — 스택" };

/**
 * /f2 — 스택. 프로젝트마다 스크린샷이 깊이로 쌓여 있고 포커스 · hover 로 펼쳐진다.
 * CSS 3D(`transform-style: preserve-3d`) 로 구현했다 — WebGL 이 아니다.
 * 상세: `StackShowcase.tsx`.
 */
export default function F2Page() {
  return (
    <main id="main">
      <NameScreen />
      <StackShowcase />
    </main>
  );
}
