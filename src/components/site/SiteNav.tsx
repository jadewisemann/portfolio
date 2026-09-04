"use client";

import { useEffect, useState } from "react";
import { SECTIONS } from "@/content/site";
import styles from "./SiteNav.module.css";

/**
 * 상단 내비(떠 있는 유리 알약)와 오른쪽 가장자리의 페이지 표시.
 *
 * 설정(테마 · 서체 선택)은 내비에서 뺐다 (소유자, 2026-09-04: "nav 에 설정은 없어도
 * 되겠다"). 부트 스크립트(`src/lib/preferences.ts`)는 그대로 돌아 저장된 값이 있으면
 * 읽지만, 화면에서 바꾸는 장치는 없다 — 기본은 grotesk + 다크다.
 *
 * 절 네 개(메인 · 스킬 · 프로젝트 · 이력)의 순서는 `SECTIONS` 배열 하나가 정본이므로,
 * 순서를 바꾸려면 그 배열만 고치면 됩니다. 두 장치가 같은 `current` 를 읽습니다.
 *
 * 현재 위치는 IntersectionObserver 로 잡습니다 — 스크롤 좌표를 매 프레임 읽지 않습니다.
 * 관측 창을 화면 위쪽 45% 로 좁혀(`rootMargin`) 「화면을 채우고 있는 절」 하나만 켜집니다.
 *
 * **알약은 아래로 내려갈 때 숨고, 올라올 때 또는 입력이 1.8초 멎으면 나타납니다**
 * (소유자 지시, 2026-09-04).
 * 이것은 스크럽이 아니라 **이산 상태 둘**입니다 (MOTION_LANGUAGE.md 5.1 — "연속은 없다,
 * 이산은 있다"): 스크롤 이벤트에서 직전 위치와의 차가 문턱(12px)을 넘을 때만 방향을
 * 판정하고, 숨김/표시 둘 중 하나로 바꿉니다. 전이는 CSS 가 소유합니다(`--duration-sort`).
 * 위치 값 자체는 어떤 속성에도 쓰지 않습니다. `requestAnimationFrame` 도 쓰지 않습니다 —
 * 스크롤 이벤트는 이미 프레임에 맞춰 옵니다.
 *
 * 이동은 평범한 앵커입니다. `scroll-behavior` 를 쓰지 않으므로 이송 지속 시간은
 * 브라우저와 사용자 설정의 것이고 이 사이트가 소유하지 않습니다.
 */
export function SiteNav() {
  const [current, setCurrent] = useState<string>(SECTIONS[0].id);
  const [hidden, setHidden] = useState(false);

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

  useEffect(() => {
    let last = window.scrollY;
    let idle = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - last;
      // 문턱 아래의 떨림은 무시한다 — 트랙패드의 관성 스크롤이 방향을 뒤집는다.
      if (Math.abs(delta) < 12) return;
      last = y;
      // 첫 화면 안에서는 절대 숨지 않는다. 이름 위의 알약은 구도의 일부다.
      const hide = delta > 0 && y > 120;
      setHidden(hide);
      // 입력이 멎으면 슬그머니 돌아온다 (소유자, 2026-09-04). 마지막 스크롤 뒤 1.8초.
      window.clearTimeout(idle);
      if (hide) idle = window.setTimeout(() => setHidden(false), 1800);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(idle);
    };
  }, []);

  const currentIndex = Math.max(
    0,
    SECTIONS.findIndex((section) => section.id === current),
  );

  return (
    <>
      <header className={`${styles.header} glass`} data-hidden={hidden || undefined}>
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
      </header>

      {/*
        페이지 표시 (소유자 지시, 2026-09-04). 오른쪽 가장자리에 절 수만큼 점, 위에
        `01 / 04`. 상단 알약이 숨어 있을 때도 남아 있으므로 위치를 잃지 않습니다.
        점은 앵커이므로 내비이기도 합니다 — 상단 알약과 같은 목록의 두 번째 표현입니다.
      */}
      <nav className={styles.pager} aria-label="페이지">
        <p className={styles.counter} aria-hidden="true">
          {String(currentIndex + 1).padStart(2, "0")}
          <span className={styles.counterOf}> / {String(SECTIONS.length).padStart(2, "0")}</span>
        </p>
        <ol className={styles.dots}>
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                className={styles.dot}
                href={`#${section.id}`}
                aria-label={section.nav}
                aria-current={current === section.id ? "true" : undefined}
              />
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
