import { Marquee } from "@/components/motion/Marquee";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ExperienceSection } from "@/components/site/ExperienceSection";
import { Footer } from "@/components/site/Footer";
import { HeroSection } from "@/components/site/HeroSection";
import { ProjectsSection } from "@/components/site/ProjectsSection";
import { SiteNav } from "@/components/site/SiteNav";
import { SkillsSection } from "@/components/site/SkillsSection";
import { marqueeItems } from "@/content/site";

/*
  `/` — 한 장짜리 사이트. 절은 네 개이고 순서는 다음과 같습니다:

      main → skills → project → 이력

  순서의 정본은 `src/content/site.ts` 의 `SECTIONS` 배열이고, 상단 내비게이션도 그
  배열을 읽습니다. 이 파일은 배열 순서대로 컴포넌트를 놓기만 합니다.

  깊이(아키텍처 · 코드 리딩)는 여기 두지 않고 프로젝트 페이지(`/projects/yorr`)로
  보냅니다 — 포트폴리오는 설명하지 않고 보여 줍니다.

  `SmoothScroll` 과 `ScrollProgress` 는 화면에 아무것도 그리지 않거나(전자) 1px 만
  그리지만(후자), 둘 다 페이지 전체를 대상으로 하므로 여기 있습니다.
*/
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <ScrollProgress />
      <SiteNav />
      <main id="main">
        <HeroSection />
        <SkillsSection />
        <Marquee items={marqueeItems} />
        <ProjectsSection />
        <ExperienceSection />
      </main>
      <Footer />
    </>
  );
}
