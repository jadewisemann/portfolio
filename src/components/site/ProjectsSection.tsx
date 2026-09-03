import Link from "next/link";
import { PROJECTS } from "@/components/showcase/shots";
import {
  SECTIONS,
  minorProjects,
  projectDetails,
  projectsDisclosure,
} from "@/content/site";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import styles from "./ProjectsSection.module.css";

/**
 * 셋째 절(프로젝트).
 *
 * 이름 · 블러브 · 키워드의 정본은 `src/components/showcase/shots.ts` 의 `PROJECTS`
 * 이고, 기간 · 팀 · 역할 · 스택 · 사실 · 링크는 `src/content/site.ts` 의
 * `projectDetails` 입니다. 두 곳을 `id` 로 맞춥니다 — 한쪽에만 있는 프로젝트는
 * 화면에 나오지 않습니다.
 *
 * 스크린샷은 아직 없습니다 (`CONTENT.md` §8 — 프로젝트 이미지 · 영상 없음). 빈 액자를
 * 놓아 「준비 중」으로 보이게 하는 시도를 두 번 했고 두 번 실패했으므로
 * (`HANDOFF.md` §2), 자산이 올 때까지는 액자를 놓지 않고 활자가 지면을 지탱합니다.
 */
export function ProjectsSection() {
  const meta = SECTIONS[2];

  const cards = PROJECTS.map((project) => ({
    project,
    detail: projectDetails.find((entry) => entry.id === project.id),
  })).filter(
    (card): card is { project: (typeof PROJECTS)[number]; detail: (typeof projectDetails)[number] } =>
      card.detail !== undefined,
  );

  return (
    <Section meta={meta} index={2}>
      <ol className={styles.list}>
        {cards.map(({ project, detail }, index) => (
          <li key={project.id}>
            <Reveal>
              <article className={styles.card} id={`project-${project.id}`}>
                <header className={styles.head}>
                  <p className={styles.index}>{String(index + 1).padStart(2, "0")}</p>
                  <h3 className={styles.name}>{project.name}</h3>
                  <p className={styles.period}>{detail.period}</p>
                </header>

                <p className={styles.blurb}>{project.blurb}</p>

                <ul className={styles.keywords}>
                  {project.keywords.map((keyword) => (
                    <li className={styles.keyword} key={keyword}>
                      {keyword}
                    </li>
                  ))}
                </ul>

                <div className={styles.columns}>
                  <dl className={styles.meta}>
                    <div className={styles.metaRow}>
                      <dt className={styles.metaKey}>팀</dt>
                      <dd className={styles.metaValue}>{detail.team}</dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt className={styles.metaKey}>역할</dt>
                      <dd className={styles.metaValue}>{detail.role}</dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt className={styles.metaKey}>스택</dt>
                      <dd className={styles.metaValue}>{detail.stack.join(" · ")}</dd>
                    </div>
                  </dl>

                  <ul className={styles.facts}>
                    {detail.facts.map((fact) => (
                      <li className={styles.fact} key={fact}>
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>

                <footer className={styles.links}>
                  {project.href ? (
                    <Link className={styles.deep} href={project.href}>
                      구조와 코드 읽기
                    </Link>
                  ) : null}
                  {detail.links.map((link) => (
                    <a className={styles.link} href={link.href} key={link.href}>
                      {link.label}
                    </a>
                  ))}
                </footer>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal className={styles.minor}>
        <h3 className={styles.minorTitle}>그 외</h3>
        <ul className={styles.minorList}>
          {minorProjects.map((project) => (
            <li className={styles.minorItem} key={project.name}>
              <span className={styles.minorName}>{project.name}</span>
              <span className={styles.minorPeriod}>{project.period}</span>
              <span className={styles.minorLine}>{project.line}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal className={styles.disclosure}>
        <ul className={styles.disclosureList}>
          {projectsDisclosure.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
