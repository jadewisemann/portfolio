"use client";

import { useState } from "react";
import { PlaceholderFrame } from "../PlaceholderFrame";
import { ProjectMeta } from "../ProjectMeta";
import { PROJECTS, type ShowcaseProject } from "../shots";
import styles from "./CarouselShowcase.module.css";

function Carousel({ project }: { project: ShowcaseProject }) {
  const count = project.shots.length;
  const [active, setActive] = useState(0);

  const go = (delta: number) => {
    setActive((current) => (current + delta + count) % count);
  };

  return (
    <div className={styles.project}>
      <p className={styles.label}>{project.name}</p>

      {/* 데스크톱: 90deg 씩 조각난 회전 링. 링 자체가 -active*90deg 만큼 돈다. */}
      <div className={styles.ringStage}>
        <div
          className={styles.ring}
          style={{ transform: `rotateY(${-active * 90}deg)` }}
        >
          {project.shots.map((shot, i) => (
            <button
              aria-label={`${project.name} 스크린샷 ${i + 1} / ${count}`}
              className={styles.ringCard}
              data-index={i}
              key={shot.alt}
              onClick={() => setActive(i)}
              type="button"
            >
              <PlaceholderFrame className={styles.frame} shot={shot} />
            </button>
          ))}
        </div>
      </div>

      {/* 모바일: 앞뒤로 겹친 플립 스택. 링 기하는 좁은 폭에서 성립하지 않으므로
          축을 바꾸는 대신 구성 자체를 바꾼다(데스크톱을 줄인 것이 아니다). */}
      <div className={styles.flipStage}>
        <div className={styles.flip}>
          {project.shots.map((shot, i) => (
            <button
              aria-label={`${project.name} 스크린샷 ${i + 1} / ${count}`}
              className={styles.flipCard}
              data-offset={(i - active + count) % count}
              key={shot.alt}
              onClick={() => go(1)}
              type="button"
            >
              <PlaceholderFrame className={styles.frame} shot={shot} />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.controlButton}
          onClick={() => go(-1)}
          type="button"
        >
          이전
        </button>
        <button
          className={styles.controlButton}
          onClick={() => go(1)}
          type="button"
        >
          다음
        </button>
      </div>

      <ProjectMeta project={project} />
    </div>
  );
}

/**
 * /f3 — CSS 3D 전용 대조군. WebGL 이 없다. 데스크톱은 회전 링, 모바일은 앞뒤로
 * 겹친 플립 스택 — 같은 상태(activeIndex)를 공유하는 두 구성을 미디어 쿼리로
 * 가른다(둘 다 마크업에는 있고 CSS 로만 보인다/숨는다).
 *
 * 「이전 · 다음」 버튼이 포인터 경로이자 키보드 경로다 — 네이티브 버튼이므로
 * 둘을 따로 구현할 필요가 없다. 각 스크린샷 자체도 버튼이라 Tab 으로 순회되고
 * 클릭하면 그 화면이 앞으로 온다.
 */
export function CarouselShowcase() {
  return (
    <div className={styles.stage}>
      {PROJECTS.map((project) => (
        <Carousel key={project.id} project={project} />
      ))}
    </div>
  );
}
