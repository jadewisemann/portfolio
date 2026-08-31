import { PlaceholderFrame } from "./PlaceholderFrame";
import { ProjectMeta } from "./ProjectMeta";
import { PROJECTS } from "./shots";
import styles from "./StaticFallback.module.css";

/**
 * /f1 의 정적 대안. WebGL 없음 · JS 없음 · 축소 모션 세 조건이 전부 이것 하나로
 * 향한다 (MOTION_LANGUAGE.md 1.4) — 셋을 따로 설계하지 않는다. 이유: 세 조건에서
 * 사라지는 것은 전부 같다(카메라 시차 · 스크롤 돌리 · 팬아웃 애니메이션). 남는 것도
 * 같다(스크린샷 · 키워드 · 블러브). 평평한 그리드 하나로 세 조건 모두 완전한
 * 화면이 된다.
 */
export function StaticFallback() {
  return (
    <div className={styles.stage}>
      {PROJECTS.map((project) => (
        <section className={styles.project} key={project.id}>
          <ProjectMeta project={project} />
          <div className={styles.frames}>
            {project.shots.map((shot, i) => (
              <PlaceholderFrame
                className={styles.frame}
                key={`${project.id}-${i}`}
                shot={shot}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
