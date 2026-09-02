import Link from "next/link";
import type { ShowcaseProject } from "./shots";
import styles from "./ProjectMeta.module.css";

/**
 * 키워드 · 블러브. 첫 화면(NameScreen) 다음에만 등장한다 — 스크롤하거나
 * 상호작용해야 도달한다는 브리프 조건은 이 컴포넌트를 어디에 배치하느냐로
 * 지킨다(컴포넌트 자체는 위치를 모른다).
 *
 * `variant="masthead"` (성능/시각 감사 §5): `CorridorGallery` 의 전폭 캡션 판
 * 전용. 기본(`"stacked"`)은 이름 · 블러브 · 키워드 · 더보기를 그대로 세로로
 * 쌓는다(`StaticFallback` · `MobileFilmstrip` 이 이 값을 쓴다) — `.primary` ·
 * `.secondary` 가 `display: contents` 라 DOM 구조만 생기고 시각적으로는 이전과
 * 같다. `masthead` 는 768px 이상에서 그 둘을 좌우로 나란히 놓아, 판의 세로 합을
 * 네 요소의 합이 아니라 더 큰 한 칸의 높이로 줄인다(판이 프레임을 매 프레임
 * 가로지르던 결함). Motion 의 shared-layout `layout` prop 과 이름이 겹치지
 * 않도록 `variant` 라 부른다(`motion-ownership.test.ts` 가 `layout=` 을 grep 한다).
 */
export function ProjectMeta({
  project,
  variant = "stacked",
}: {
  project: ShowcaseProject;
  variant?: "stacked" | "masthead";
}) {
  return (
    <div
      className={
        variant === "masthead" ? `${styles.meta} ${styles.metaMasthead}` : styles.meta
      }
    >
      <div className={styles.primary}>
        <h2 className={styles.name}>{project.name}</h2>
        <p className={styles.blurb}>{project.blurb}</p>
      </div>
      <div className={styles.secondary}>
        <ul className={styles.keywords}>
          {project.keywords.map((keyword) => (
            <li className={styles.keyword} key={keyword}>
              {keyword}
            </li>
          ))}
        </ul>
        {/*
          아키텍처 · 코드 리딩은 프로젝트 페이지로 간다 — 랜딩은 보여주고, 거기서
          설명한다 (CLAUDE.md 「What the owner actually wants」). 페이지가 아직 없는
          프로젝트는 href 가 없으므로 링크를 만들지 않는다.
        */}
        {project.href ? (
          <p className={styles.more}>
            <Link href={project.href}>더 보기 — 아키텍처 · 코드 리딩</Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
