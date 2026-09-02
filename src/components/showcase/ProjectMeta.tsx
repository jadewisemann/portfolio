import Link from "next/link";
import type { ShowcaseProject } from "./shots";
import styles from "./ProjectMeta.module.css";

/**
 * 키워드 · 블러브. 첫 화면(NameScreen) 다음에만 등장한다 — 스크롤하거나
 * 상호작용해야 도달한다는 브리프 조건은 이 컴포넌트를 어디에 배치하느냐로
 * 지킨다(컴포넌트 자체는 위치를 모른다).
 */
export function ProjectMeta({ project }: { project: ShowcaseProject }) {
  return (
    <div className={styles.meta}>
      <p className={styles.name}>{project.name}</p>
      <p className={styles.blurb}>{project.blurb}</p>
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
  );
}
