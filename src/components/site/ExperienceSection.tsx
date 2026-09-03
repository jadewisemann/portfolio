import { SECTIONS, timeline } from "@/content/site";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import styles from "./ExperienceSection.module.css";

/**
 * 넷째 절(이력). 최근이 위입니다.
 *
 * 항목은 `src/content/site.ts` 의 `timeline` 하나에서만 옵니다. 정렬은 화면이 아니라
 * 데이터가 책임집니다 — `when` 이 `YYYY.MM` 이므로 사전순 역순이 곧 시간순 역순입니다.
 * 프로젝트 항목은 위의 프로젝트 절 카드로 되돌아가는 앵커를 답니다.
 */
export function ExperienceSection() {
  const meta = SECTIONS[3];
  const entries = [...timeline].sort((a, b) => b.when.localeCompare(a.when));

  return (
    <Section meta={meta} index={3}>
      <ol className={styles.timeline}>
        {entries.map((entry) => (
          <li className={styles.entry} key={`${entry.when}-${entry.title}`}>
            <Reveal className={styles.row}>
              <p className={styles.when}>{entry.span ?? entry.when}</p>
              <div className={styles.body}>
                <p className={styles.kind}>{entry.kind}</p>
                <h3 className={styles.title}>
                  {entry.href ? (
                    <a className={styles.titleLink} href={entry.href}>
                      {entry.title}
                    </a>
                  ) : (
                    entry.title
                  )}
                </h3>
                {entry.detail ? <p className={styles.detail}>{entry.detail}</p> : null}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
