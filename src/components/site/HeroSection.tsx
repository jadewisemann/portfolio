import { SECTIONS, profile } from "@/content/site";
import { Reveal } from "./Reveal";
import styles from "./HeroSection.module.css";

/**
 * 첫 절(메인). 뷰포트를 이름 하나가 지배하고, 나머지는 두 문장과 숫자 세 개입니다.
 *
 * 왜 이만큼만 두는가: 첫 화면에서 글자가 거의 없어야 한다는 소유자 지시
 * (`CLAUDE.md` — "첫 페이지에서는 글자가 거의 없어야 해") 때문입니다. 설명은 아래
 * 절들이 맡고, 여기서는 이름과 포지셔닝 두 문장만 세웁니다.
 */
export function HeroSection() {
  const meta = SECTIONS[0];

  return (
    <section className={styles.hero} id={meta.id} aria-labelledby={`${meta.id}-title`}>
      <Reveal className={styles.eyebrow}>
        <p className={styles.role}>{profile.role}</p>
      </Reveal>

      <Reveal className={styles.nameWrap} delay={0.06}>
        <h1 className={styles.name} id={`${meta.id}-title`}>
          {profile.name}
        </h1>
      </Reveal>

      <Reveal className={styles.lines} delay={0.12}>
        {profile.lines.map((line) => (
          <p className={styles.line} key={line}>
            {line}
          </p>
        ))}
      </Reveal>

      <Reveal className={styles.figuresWrap} delay={0.18}>
        <dl className={styles.figures}>
          {profile.figures.map((figure) => (
            <div className={styles.figure} key={figure.label}>
              <dt className={styles.figureLabel}>{figure.label}</dt>
              <dd className={styles.figureValue}>
                <span className={styles.figureNumber}>{figure.value}</span>
                <span className={styles.figureUnit}>{figure.unit}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
