import type { CSSProperties } from "react";
import { PlaceholderFrame } from "../PlaceholderFrame";
import { ProjectMeta } from "../ProjectMeta";
import { PROJECTS, type ShowcaseProject } from "../shots";
import styles from "./StackShowcase.module.css";

/** 다수결로 그 프로젝트의 대표 화면비를 정한다 (YORR·Pookjayo=모바일, FF=데스크톱). */
function dominantOrientation(project: ShowcaseProject): "mobile" | "desktop" {
  const mobileCount = project.shots.filter((s) => s.kind === "mobile").length;
  return mobileCount >= project.shots.length / 2 ? "mobile" : "desktop";
}

function Stack({ project }: { project: ShowcaseProject }) {
  return (
    <div className={styles.project}>
      <p className={styles.label}>{project.name}</p>
      <div className={styles.stackWrap} data-orientation={dominantOrientation(project)}>
        <div className={styles.stack}>
          {project.shots.map((shot, i) => (
            <button
              aria-label={`${project.name} 스크린샷 ${i + 1} / ${project.shots.length}`}
              className={styles.card}
              key={shot.alt}
              style={{ "--i": i } as CSSProperties}
              type="button"
            >
              <PlaceholderFrame className={styles.frame} shot={shot} />
            </button>
          ))}
        </div>
      </div>
      <ProjectMeta project={project} />
    </div>
  );
}

/**
 * /f2 — 스택. 프로젝트마다 스크린샷이 근접 · 살짝 회전된 채로 겹쳐 있고,
 * 스택에 마우스를 올리거나(hover) 카드 하나에 포커스가 들어오면(:focus-within)
 * 부채꼴로 펼쳐진다. 카드 자체가 버튼이므로 Tab 이 곧 키보드 경로다.
 *
 * CSS 3D 선택 이유는 `StackShowcase.module.css` 상단 주석 참고.
 */
export function StackShowcase() {
  return (
    <div className={styles.stage}>
      {PROJECTS.map((project) => (
        <Stack key={project.id} project={project} />
      ))}
    </div>
  );
}
