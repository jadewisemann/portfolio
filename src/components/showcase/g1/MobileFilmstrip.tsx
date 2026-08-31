import { PlaceholderFrame } from "../PlaceholderFrame";
import { ProjectMeta } from "../ProjectMeta";
import { PROJECTS } from "../shots";
import styles from "./MobileFilmstrip.module.css";

/**
 * 320px 복도. 데스크톱을 줄인 것이 아니다 — 스크롤 돌리 대신 프로젝트마다
 * 가로 필름스트립을 두고, 한 손 스와이프로 그 프로젝트의 화면을 넘겨 본다.
 * WebGL 도 JS 도 필요 없다 — `overflow-x: auto` + `scroll-snap` 뿐이다
 * (DESIGN_SYSTEM.md 5절의 `.scroll-x`: 넓은 산출물은 자기 컨테이너 안에서만
 * 가로 스크롤한다. `documentElement` 는 가로로 스크롤되지 않는다).
 */
export function MobileFilmstrip() {
  return (
    <div className={styles.stage}>
      {PROJECTS.map((project) => (
        <section className={styles.project} key={project.id}>
          <ProjectMeta project={project} />
          <div className={`scroll-x ${styles.strip}`}>
            <ul className={styles.stripList}>
              {project.shots.map((shot, i) => (
                <li className={styles.stripItem} key={`${project.id}-${i}`}>
                  <PlaceholderFrame className={styles.frame} shot={shot} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </div>
  );
}
