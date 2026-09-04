import styles from "./Footer.module.css";

/**
 * 닫는 절. 링크 셋 — GitHub · Velog · 이메일 (소유자 지시, 2026-09-04: "footer 에는
 * 이 셋만"). 프로젝트별 링크는 각 프로젝트 장에 있으므로 여기서 반복하지 않는다.
 * 요약 문구를 새로 쓰지 않는다.
 *
 * 고지(뺀 기술 · 과장 금지 문장)는 화면에 없다 (소유자 지시, 2026-09-04 — 하단 각주로
 * 옮긴 뒤 같은 날 "이거 제거하고"). 문장은 `src/content/site.ts` 의 `skillsDisclosure` ·
 * `projectsDisclosure` 에 남아 `forbidden-claims` 게이트와 프로젝트 페이지의 원장 노릇을
 * 한다 — 규율은 코드가 지키고, 화면은 보여주기만 한다.
 */
const GENERAL_LINKS = [
  { label: "GitHub", href: "https://github.com/jadewisemann" },
  { label: "Velog", href: "https://velog.io/@jadewisemann" },
  { label: "이메일", href: "mailto:jadewisemann@gmail.com" },
] as const;


export function Footer() {
  return (
    <footer className={styles.footer}>
      <ul className={styles.general}>
        {GENERAL_LINKS.map((link) => (
          <li key={link.label}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>


    </footer>
  );
}
