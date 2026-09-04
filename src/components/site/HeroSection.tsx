import { SECTIONS, profile } from "@/content/site";
import { Reveal } from "./Reveal";
import styles from "./HeroSection.module.css";

/**
 * 첫 절(메인) — 이름 하나. 뷰포트를 이름이 지배하고 다른 글자는 없다
 * (`CLAUDE.md` — "첫 페이지에서는 글자가 거의 없어야 해").
 *
 * 역할 · 포지셔닝 두 문장 · 실측 숫자는 여기 없다 (소유자 지시, 2026-09-04). 하루 전에
 * 「2장 유리 카드」로 두었던 것을 "너무 어색하다"고 걷어냈다. 그 사실들은
 * `src/content/site.ts` 의 `profile` 에 그대로 있고, 깊이가 필요한 사람은 프로젝트
 * 페이지로 간다 — "screenshots and keywords on the surface, depth one click away".
 */
export function HeroSection() {
  const meta = SECTIONS[0];

  return (
    <section className={styles.hero} id={meta.id} aria-labelledby={`${meta.id}-title`}>
      <Reveal className={styles.nameWrap}>
        <h1 className={styles.name} id={`${meta.id}-title`}>
          {profile.name}
        </h1>
      </Reveal>
    </section>
  );
}
