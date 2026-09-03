import { ExperienceSection } from "@/components/site/ExperienceSection";
import { Footer } from "@/components/site/Footer";
import { HeroSection } from "@/components/site/HeroSection";
import { ProjectsSection } from "@/components/site/ProjectsSection";
import { SiteNav } from "@/components/site/SiteNav";
import { SkillsSection } from "@/components/site/SkillsSection";

/*
  `/` — 한 장짜리 사이트. 절은 네 개이고 순서는 소유자 지시(2026-09-03)를 따릅니다:

      메인 → 스킬 → 프로젝트 → 이력

  순서의 정본은 `src/content/site.ts` 의 `SECTIONS` 배열이고, 상단 내비게이션도 그
  배열을 읽습니다. 이 파일은 배열 순서대로 컴포넌트를 놓기만 합니다.

  깊이(아키텍처 · 코드 리딩)는 여기 두지 않고 프로젝트 페이지(`/projects/yorr`)로
  보냅니다 — `CLAUDE.md` 「A portfolio shows; it does not explain」.

  이전 구성(3D 회랑 히어로 + 스크롤 회랑)은 이 라운드에서 걷어냈습니다. 사유는
  `docs/portfolio/DECISIONS.md` 의 2026-09-03 항목에 있습니다.
*/
export default function Home() {
  return (
    <>
      <SiteNav />
      <main id="main">
        <HeroSection />
        <SkillsSection />
        <ProjectsSection />
        <ExperienceSection />
      </main>
      <Footer />
    </>
  );
}
