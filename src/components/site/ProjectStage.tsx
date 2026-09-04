"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlaceholderFrame } from "@/components/showcase/PlaceholderFrame";
import type { Shot, ShowcaseProject } from "@/components/showcase/shots";
import type { ProjectDetail, SectionMeta } from "@/content/site";
import { Reveal } from "./Reveal";
import section from "./Section.module.css";
import styles from "./ProjectsSection.module.css";

export interface ProjectPage {
  project: ShowcaseProject;
  detail: ProjectDetail;
}

export interface MinorProject {
  name: string;
  period: string;
  line: string;
}

/** 한 프로젝트의 가로 장들. 첫 장은 글, 다음은 데스크톱 화면 한 장씩, 마지막은 모바일 화면 묶음. */
type Slide = { kind: "text" } | { kind: "desktop"; shot: Shot } | { kind: "mobiles"; shots: Shot[] };

function slidesOf(project: ShowcaseProject): Slide[] {
  const desktops = project.shots.filter((shot) => shot.kind === "desktop");
  const mobiles = project.shots.filter((shot) => shot.kind === "mobile");
  return [
    { kind: "text" },
    ...desktops.map((shot): Slide => ({ kind: "desktop", shot })),
    ...(mobiles.length ? [{ kind: "mobiles", shots: mobiles } as Slide] : []),
  ];
}

/**
 * 프로젝트 절의 무대 (소유자 지시, 2026-09-04, 두 번 고침).
 *
 *   표지        「03 project」가 뷰포트 가운데에 있는 한 장.
 *   아래로      제목이 위로 올라가 붙고, 프로젝트 하나가 한 줄(row)을 차지한다.
 *               프로젝트 사이는 **세로**로 넘어간다.
 *   옆으로      한 프로젝트 안에서는 **가로**로 넘어간다 — 글 한 장, 데스크톱 화면 한 장씩,
 *               모바일 화면 묶음 한 장. 스크린샷과 영상이 들어갈 자리가 여기다.
 *
 * **스크럽이 아니다** (MOTION_LANGUAGE.md 5.1). 구조는 셋이다:
 *
 *   1. 절의 높이는 (장 수 전체) × 100svh 이고, 그 안에 100svh 짜리 투명한 **슬롯**이 장 수만큼
 *      세로로 쌓여 있다. 슬롯마다 `scroll-snap-align: start` — 브라우저가 슬롯에서 슬롯으로
 *      한 번에 넘긴다 (사이트 전체의 절 스냅과 같은 장치). 사용자는 세로로만 스크롤한다.
 *   2. 무대는 `position: sticky` 로 뷰포트에 붙어 있다. 어느 슬롯이 화면 가운데 띠에
 *      들어왔는지는 IntersectionObserver 가 알려 준다 — 스크롤 좌표를 읽지 않는다.
 *   3. 슬롯 번호 하나가 상태다. 번호를 (줄, 칸)으로 풀어 CSS 가 줄 묶음을 세로로, 그 줄의
 *      레일을 가로로 `translate` 한다. 제목도 `translate` 로 가운데 → 위. 전이의 시간과
 *      이징은 CSS 토큰이 소유한다.
 *
 * 그래서 프레임마다 하는 일이 없다. 스크롤 중 자바스크립트는 IO 콜백 몇 번뿐이다.
 *
 * 화면 밖의 장은 `inert` 다 — 보이지 않는 링크가 탭 순서에 끼지 않는다. 축소 모션에서는
 * 전이가 없고 장이 즉시 바뀐다 (`ProjectsSection.module.css` 끝).
 */
export function ProjectStage({
  meta,
  index,
  pages,
  minor,
}: {
  meta: SectionMeta;
  index: number;
  pages: readonly ProjectPage[];
  minor: readonly MinorProject[];
}) {
  const rows = useMemo(() => pages.map(({ project }) => slidesOf(project)), [pages]);

  /* 슬롯 번호 → (줄, 칸). 0 은 표지, 마지막은 「그 외」. */
  const slotMap = useMemo(() => {
    const map: { row: number; col: number }[] = [{ row: 0, col: 0 }];
    rows.forEach((slides, r) => slides.forEach((_, c) => map.push({ row: r + 1, col: c })));
    map.push({ row: rows.length + 1, col: 0 });
    return map;
  }, [rows]);

  const [slot, setSlot] = useState(0);
  const { row, col } = slotMap[Math.min(slot, slotMap.length - 1)];

  /*
    **줄이 바뀌는 동안**(`--duration-spine`)만 켜지는 표지. CSS 가 이 동안 장의 구성요소를
    제각각 흩어 놓고, 도착하면 다시 모은다 (소유자 지시, 2026-09-04 — "블러라기보다는
    구성요소가 흩어지게"). 한 프로젝트 안의 가로 이동(칸 바뀜)에는 걸지 않는다 — 옆으로
    미는 동작 자체가 이미 전이다. 타이머 하나, 프레임 단위 작업이 아니다. 900 은
    `--duration-spine` 과 같은 수다.
  */
  /*
    화면 장(col > 0)에서 제목 옆에 붙는 프로젝트 이름. 표지와 「그 외」에는 없다.

    사라지는 동안에는 **직전에 보이던 이름**을 유지한다 (소유자, 2026-09-04 — "다음 페이지로
    넘어갈 때 이름이 나왔다가 삭제된다"). 줄이 바뀌면 `row` 는 즉시 새 프로젝트를 가리키는데
    `data-on` 은 꺼지는 중이라, 이름을 바로 바꾸면 새 이름이 한 순간 나타났다 사라졌다.
    그래서 보이는 동안(col > 0)에만 이름을 갱신하고, 꺼지는 동안은 마지막 값을 쓴다.
  */
  const [headName, setHeadName] = useState("");
  const [moving, setMoving] = useState(false);
  const movingTimer = useRef(0);
  const slotRef = useRef(0);
  const goTo = useCallback(
    (next: number) => {
      const target = slotMap[next];
      const rowChanged = target?.row !== slotMap[slotRef.current]?.row;
      slotRef.current = next;
      setSlot(next);
      // 보이는 동안(칸 > 0)에만 이름을 갱신한다 — 꺼지는 동안은 마지막 값이 남는다.
      if (target && target.col > 0 && target.row >= 1 && target.row <= pages.length) {
        setHeadName(pages[target.row - 1].project.name);
      }
      if (!rowChanged) return;
      setMoving(true);
      window.clearTimeout(movingTimer.current);
      movingTimer.current = window.setTimeout(() => setMoving(false), 900);
    },
    [slotMap, pages],
  );

  useEffect(() => {
    const slots = document.querySelectorAll<HTMLElement>(`#${meta.id} [data-slot]`);
    if (slots.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) goTo(Number((entry.target as HTMLElement).dataset.slot));
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    slots.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [meta.id, goTo]);

  /*
    휠 한 번 = 장 한 장 (소유자, 2026-09-04 — "스크롤하면 자동으로 넘어간다").

    슬롯 스냅만으로는 트랙패드의 관성 한 번이 슬롯 여럿을 지나갔다. 그래서 무대 안에서는
    휠을 가로채 **이산 걸음**으로 바꾼다: 델타를 모아 문턱(40)을 넘으면 한 장만 옮기고,
    전이가 끝날 때까지(1050ms > `--duration-spine` 900ms) 다음 걸음을 받지 않는다.

    이것도 스크럽이 아니다 — 휠 이벤트마다 한 번 판정하고, 스크롤 좌표는 "지금 몇 번째
    슬롯인가"를 알기 위해 이벤트 때만 읽는다. 프레임마다 읽는 것이 없다.

    무대의 첫 장에서 위로, 마지막 장에서 아래로 가는 휠은 가로채지 않는다 — 절 밖으로
    나가는 것은 브라우저의 스냅이 맡는다. 터치와 키보드도 가로채지 않는다(휠 이벤트가
    아니다) — 그쪽은 슬롯 스냅 그대로다.
  */
  useEffect(() => {
    const sec = document.getElementById(meta.id);
    if (!sec) return;
    let acc = 0;
    let busyUntil = 0;
    let lastWheel = 0;
    let gestureStart = 0;
    const onWheel = (e: WheelEvent) => {
      const top = sec.getBoundingClientRect().top + window.scrollY;
      const h = window.innerHeight;
      const idx = Math.round((window.scrollY - top) / h);
      if (idx < 0 || idx > slotMap.length - 1) return;
      const dir = Math.sign(e.deltaY);
      if (dir === 0) return;
      // 표지에서 위로는 가로채지 않는다 — 위 절(스킬)은 자유 스크롤 구간이다.
      if (idx === 0 && dir < 0) return;
      e.preventDefault();
      const now = performance.now();
      /*
        제스처 경계. 휠 이벤트 사이가 120ms 넘게 비면 새 제스처다. **전이 중에 시작된
        제스처는 통째로 버린다** — 전이가 끝난 뒤 남은 관성이 다음 장을 또 넘기던 것을
        막는다 (소유자, 2026-09-04: "급하게 스크롤해도 한 번에 처리돼 넘어가게 하지 말고").
        한 걸음은 언제나 전이가 끝난 **뒤에 시작한** 제스처에서만 나온다.
      */
      if (now - lastWheel > 120) gestureStart = now;
      lastWheel = now;
      if (gestureStart < busyUntil) return;
      acc += e.deltaY;
      if (Math.abs(acc) < 40) return;
      acc = 0;
      busyUntil = now + 1050;
      const next = idx + dir;
      // 마지막 장에서 아래로는 절의 끝 = 다음 절(history)의 시작이다. 브라우저 스냅에
      // 맡기면 휠 한 번의 거리(~300px)가 스냅 간격(100svh)의 절반에 못 미쳐 제자리로
      // 되돌아왔다 (2026-09-04 실측). 무대 안의 걸음은 즉시 옮긴다 — 무대가 sticky 라
      // 문서 위치의 점프는 보이지 않고 CSS `translate` 전이만 보인다. 무대를 **떠나는**
      // 걸음만 브라우저의 부드러운 이송을 쓴다 — 여기서는 문서가 실제로 움직여 보이고,
      // 즉시 옮기면 뚝 끊긴다. 이송 시간은 브라우저 것이다 (MOTION_LANGUAGE.md 5.3 과 같은
      // 이유로 사이트가 값을 갖지 않는다).
      window.scrollTo({
        top: top + next * h,
        behavior: next > slotMap.length - 1 ? "smooth" : "auto",
      });
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [meta.id, slotMap.length]);

  return (
    <section
      className={styles.section}
      id={meta.id}
      aria-labelledby={`${meta.id}-title`}
      style={{ "--slots": slotMap.length } as React.CSSProperties}
    >
      {/* 스냅 슬롯. 보이지 않고, 클릭도 먹지 않는다 — 스크롤 위치의 눈금이다. */}
      <div className={styles.slots} aria-hidden="true">
        {slotMap.map((_, i) => (
          <div className={styles.slot} data-slot={i} key={i} />
        ))}
      </div>

      <div
        className={styles.stage}
        data-row={row}
        data-moving={moving || undefined}
        style={{ "--row": row } as React.CSSProperties}
      >
        <Reveal className={`${section.head} ${styles.head}`}>
          <p className={section.index}>{String(index + 1).padStart(2, "0")}</p>
          <h2 className={section.title} id={`${meta.id}-title`}>
            {meta.title}
          </h2>
          {/*
            글 장에서 화면 장으로 옆으로 넘어가면, 글 장의 이름이 떠난 자리를 이 이름이
            제목 옆에서 이어받는다 (소유자 지시, 2026-09-04). 옆에서 들어오는 `translate` +
            `opacity` 전이 하나다 — 글 장 자체가 왼쪽으로 빠지는 방향과 반대로 들어와
            「옮겨 붙는」 것으로 읽힌다.
          */}
          <p className={styles.headName} data-on={col > 0 ? "" : undefined} aria-hidden="true">
            {headName}
          </p>
        </Reveal>

        {/* 표지의 안내. 표지에서만 보인다. */}
        <p className={styles.hint} aria-hidden="true">
          {String(pages.length).padStart(2, "0")} projects — scroll
        </p>

        <div className={styles.rows}>
          {/* 0번 줄은 표지 — 제목이 가운데에 있으므로 비어 있다. */}
          <div className={styles.row} inert={row !== 0} />

          {pages.map(({ project, detail }, r) => {
            const rowIndex = r + 1;
            const active = row === rowIndex;
            const slides = rows[r];
            return (
              <article
                className={styles.row}
                id={`project-${project.id}`}
                key={project.id}
                inert={!active}
                aria-labelledby={`project-${project.id}-name`}
                /*
                  안 보이는 줄의 칸. 위에 있는 줄은 **마지막 칸**, 아래 있는 줄은 **첫 칸**에
                  대 놓는다 — 세로로 이웃 줄에 들어갈 때 도착하는 칸이 그 칸이기 때문이다
                  (슬롯은 글 → 화면 순서로 쌓인다). 전부 0 으로 두면 위 줄로 되돌아갈 때 그
                  줄의 레일이 세로 이동과 동시에 옆으로 미끄러져 장의 경계가 보였다
                  (소유자, 2026-09-04: "역방향으로 이동하면 페이지 경계가 생긴다").
                */
                style={
                  {
                    "--col": active ? col : rowIndex < row ? slides.length - 1 : 0,
                  } as React.CSSProperties
                }
              >
                <div className={styles.rail}>
                  {slides.map((slide, c) => (
                    <div className={styles.panel} key={c} inert={!active || col !== c}>
                      {slide.kind === "text" ? (
                        <div className={styles.text}>
                          <p className={styles.count}>
                            {String(rowIndex).padStart(2, "0")}
                            <span className={styles.countOf}>
                              {" "}
                              / {String(pages.length).padStart(2, "0")} · {detail.period}
                            </span>
                          </p>
                          <h3 className={styles.name} id={`project-${project.id}-name`}>
                            {project.name}
                          </h3>
                          <p className={styles.blurb}>{project.blurb}</p>
                          <ul className={styles.keywords}>
                            {project.keywords.map((keyword) => (
                              <li className={styles.keyword} key={keyword}>
                                {keyword}
                              </li>
                            ))}
                          </ul>
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
                        </div>
                      ) : slide.kind === "desktop" ? (
                        <PlaceholderFrame className={styles.desktop} shot={slide.shot} />
                      ) : (
                        <div className={styles.mobiles}>
                          {slide.shots.map((shot, k) => (
                            <PlaceholderFrame className={styles.mobile} shot={shot} key={k} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 이 프로젝트의 가로 장 표시. 현재 칸이 길어진다. */}
                <ol className={styles.slideDots} aria-hidden="true">
                  {slides.map((_, c) => (
                    <li className={styles.slideDot} data-on={active && col === c ? "" : undefined} key={c} />
                  ))}
                </ol>
              </article>
            );
          })}

          {/* 마지막 줄 — 그 외. 한 줄씩. */}
          <div className={styles.row} inert={row !== rows.length + 1}>
            <div className={styles.rail}>
              <div className={styles.panel}>
                <div className={styles.text}>
                  <p className={styles.count}>etc.</p>
                  <ul className={styles.minorList}>
                    {minor.map((project) => (
                      <li className={styles.minorItem} key={project.name}>
                        <span className={styles.minorName}>{project.name}</span>
                        <span className={styles.minorPeriod}>{project.period}</span>
                        <span className={styles.minorLine}>{project.line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
