import { PROJECTS } from "@/components/showcase/shots";
import { SECTIONS, minorProjects, projectDetails } from "@/content/site";
import { ProjectStage, type ProjectPage } from "./ProjectStage";

/**
 * 셋째 절(프로젝트). 표지 한 장 + 프로젝트마다 한 장 + 「그 외」한 장. 세로 스크롤이
 * 옆으로 넘어가는 장이 된다 — 구조는 `ProjectStage.tsx` 의 주석에 있다.
 *
 * 이름 · 블러브 · 키워드 · 스크린샷의 정본은 `src/components/showcase/shots.ts` 의
 * `PROJECTS` 이고, 기간 · 팀 · 역할 · 링크는 `src/content/site.ts` 의 `projectDetails`
 * 입니다. 두 곳을 `id` 로 맞춥니다 — 한쪽에만 있는 프로젝트는 화면에 나오지 않습니다.
 *
 * 장에 올리는 글자는 이름 · 한 줄(기간 · 팀 · 역할) · 블러브 · 키워드 · 링크뿐입니다.
 * 스택과 사실 세 줄은 랜딩에서 뺐습니다 (소유자, 2026-09-04 — "설명이 아니라
 * 시각적으로"). 그 깊이는 프로젝트 페이지의 것입니다.
 */
export function ProjectsSection() {
  const meta = SECTIONS[2];

  const pages = PROJECTS.map((project) => ({
    project,
    detail: projectDetails.find((entry) => entry.id === project.id),
  })).filter((page): page is ProjectPage => page.detail !== undefined);

  return <ProjectStage meta={meta} index={2} pages={pages} minor={minorProjects} />;
}
