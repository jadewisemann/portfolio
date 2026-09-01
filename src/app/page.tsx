import { CorridorCanvas } from "@/components/showcase/landing/CorridorCanvas";
import { Footer } from "@/components/showcase/landing/Footer";
import { HeroDiorama } from "@/components/showcase/landing/HeroDiorama";

/*
  메타데이터는 루트 `layout.tsx` 가 담당한다(이름 · 첫 문장).

  `/` — 완성된 한 페이지. 첫 화면은 이름과 이미 짜인 3D 구도뿐이다(스크롤해야
  나타나는 빈 화면이 아니다). 스크롤하면 프로젝트마다 복도를 지나며 자리표시자
  프레임과 키워드 · 블러브가 나온다. 끝에는 링크가 있다.

  이전 이름은 `/g1`(STRUCTURAL_BRANCH 후보) — 판정 후 이 자리(사이트 루트)로
  승격되었다. 상세: `src/components/showcase/landing/layout.ts`(배치 산술 · 정본),
  `HeroDiorama.tsx`(첫 화면), `CorridorCanvas.tsx`(복도).
*/
export default function Home() {
  return (
    <main id="main">
      <HeroDiorama />
      <CorridorCanvas />
      <Footer />
    </main>
  );
}
