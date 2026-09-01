import styles from "./Footer.module.css";

/**
 * 닫는 절. `CONTENT.md` §8 에서 "사용" 표시가 있는 링크만 옮긴다 — "금지" 로
 * 표시된 두 항목(`s15-Yorr` 조직 · 개인 포크 `ff_frontend__jade`)은 포함하지
 * 않는다. 요약 문구를 새로 쓰지 않는다 — 링크 목록 자체가 이 페이지의 끝이다.
 */
const GENERAL_LINKS = [
  { label: "GitHub", href: "https://github.com/jadewisemann" },
  { label: "Velog", href: "https://velog.io/@jadewisemann" },
  { label: "이메일", href: "mailto:jadewisemann@gmail.com" },
] as const;

const PROJECT_LINKS = [
  {
    name: "YORR",
    links: [{ label: "코드", href: "https://github.com/jadewisemann/yorr" }],
  },
  {
    name: "FestiFriends",
    links: [
      { label: "데모", href: "https://ff-frontend-rust.vercel.app/" },
      { label: "코드", href: "https://github.com/FestiFriends/ff_frontend" },
    ],
  },
  {
    name: "Pookjayo",
    links: [
      { label: "데모", href: "https://pookjayo.vercel.app/" },
      { label: "코드", href: "https://github.com/jadewisemann/Pookjayo" },
    ],
  },
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

      <ul className={styles.projects}>
        {PROJECT_LINKS.map((project) => (
          <li className={styles.projectRow} key={project.name}>
            <span className={styles.projectName}>{project.name}</span>
            <span className={styles.projectLinks}>
              {project.links.map((link) => (
                <a href={link.href} key={link.label}>
                  {link.label}
                </a>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </footer>
  );
}
