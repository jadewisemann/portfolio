"use client";

import { useEffect, useState } from "react";
import { SECTIONS } from "@/content/site";
import { SettingsMenu } from "./SettingsMenu";
import styles from "./SiteNav.module.css";

/**
 * 상단 고정 내비게이션. 절 네 개(메인 · 스킬 · 프로젝트 · 이력)의 순서는
 * `SECTIONS` 배열 하나가 정본이므로, 순서를 바꾸려면 그 배열만 고치면 됩니다.
 *
 * 현재 위치 표시는 IntersectionObserver 로 합니다 — 스크롤 좌표를 매 프레임 읽지
 * 않으므로 스크롤 중 자바스크립트 작업이 없습니다. 관측 창을 화면 위쪽 45% 로 좁혀
 * (`rootMargin`) 「화면을 채우고 있는 절」 하나만 켜지게 합니다.
 *
 * 이동은 평범한 앵커입니다. `scroll-behavior` 를 쓰지 않으므로(12절) 이송 지속 시간은
 * 브라우저와 사용자 설정의 것이고 이 사이트가 소유하지 않습니다.
 */
export function SiteNav() {
  const [current, setCurrent] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const targets = SECTIONS.map((section) =>
      document.getElementById(section.id),
    ).filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="절로 이동">
        <a className={styles.brand} href="#main">
          jadewisemann
        </a>

        <ol className={styles.list}>
          {SECTIONS.map((section, index) => (
            <li key={section.id}>
              <a
                className={styles.link}
                href={`#${section.id}`}
                aria-current={current === section.id ? "true" : undefined}
              >
                <span className={styles.index} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.label}>{section.nav}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <SettingsMenu />
    </header>
  );
}
