"use client";

import { useEffect, useState } from "react";
import { MARKS, type Mark } from "@/lib/gutter";

/**
 * 거터 레일. 이 사이트의 척추이며 **시각 충격을 혼자 지는 요소**입니다.
 *
 * 왜 다시 만들었나 (iteration 1 미달):
 *   처음에는 「현재 기호 하나」만 sticky 로 띄웠습니다. 시각 비평이 계측한 결과 문서 전체에
 *   기호 글리프가 5개뿐이고 sticky 마크는 뷰포트의 0.018% 였습니다. 시각 충격 4.0 으로
 *   미달했고, 판정은 「거터 열이 짧다」가 아니라 **「열이 구현되지 않았다」** 였습니다.
 *   ART_DIRECTION.md 3.7 이 요구한 것은 눈금 8개와 현재 위치 표시와 목차를 겸하는 레일입니다.
 *
 * 이제 **모든 판단의 기호를 항상 동시에** 보여줍니다. 그래야 뺄셈 우위 분포가 주변시에
 * 들어옵니다 (ART_DIRECTION.md 3.1 의 10초 독자 장치).
 *
 * 소유권 (MOTION_LANGUAGE.md 12절 항목 3·4):
 *   상태는 IntersectionObserver 가 만들고 보간은 CSS 가 합니다. IO 는 임계 통과 시점에
 *   불리언 하나를 줄 뿐이므로 스크롤 초이오그래피가 아닙니다. 콜백은 스타일을 쓰지 않습니다.
 *   색과 불투명도만 바뀌고 아무것도 이동하지 않으므로 축소 모션 대상이 아닙니다.
 *
 * 768px 미만에서는 관찰자를 만들지 않습니다 (MOTION_LANGUAGE.md 5.2).
 */
/** 문구는 이 저장소에 두지 않습니다. 호출하는 쪽이 넘깁니다. */
export type RailItem = {
  id: string;
  mark: Mark;
  /** 기호의 뜻. 기호 글리프는 aria-hidden 이므로 이것이 접근 가능한 이름을 만듭니다. */
  markLabel: string;
  title: string;
};

function useActiveId(items: readonly RailItem[], initial: string): string {
  const [active, setActive] = useState(initial);

  useEffect(() => {
    // 모바일에는 sticky 레일이 없으므로 관찰하지 않습니다.
    if (window.matchMedia("(max-width: 767px)").matches) return;

    const blocks = document.querySelectorAll<HTMLElement>("[data-mark]");
    if (blocks.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 판단 블록이 연속하므로 이 선을 지나는 블록은 항상 정확히 하나입니다.
        const hit = entries.filter((e) => e.isIntersecting).at(-1);
        if (hit?.target.id) setActive(hit.target.id);
      },
      { rootMargin: "-40% 0px -59% 0px", threshold: [0] },
    );

    blocks.forEach((b) => observer.observe(b));
    return () => observer.disconnect();
  }, [items]);

  return active;
}

export function GutterRail({
  items,
  /** 히어로 구간의 기호. 판단이 아니라 배경 정보이므로 `=` 입니다. */
  restingMark,
  restingLabel,
  label,
}: {
  items: readonly RailItem[];
  restingMark: Mark;
  restingLabel: string;
  label: string;
}) {
  const active = useActiveId(items, "");

  return (
    <nav
      aria-label={label}
      className="sticky top-0 hidden h-dvh w-gutter shrink-0 select-none flex-col justify-center md:flex"
    >
      <ol className="space-y-1">
        {/* 히어로 구간. 판단 목록에 속하지 않으므로 앵커가 아닙니다. */}
        <li
          aria-current={active === "" ? "true" : undefined}
          className="font-mono text-rail leading-rail"
        >
          <span
            className={
              active === ""
                ? "text-ink transition-colors duration-state ease-settle"
                : "text-ink-3 transition-colors duration-state ease-settle"
            }
          >
            <span aria-hidden="true">{MARKS[restingMark]}</span>
            <span className="sr-only">{restingLabel}</span>
          </span>
        </li>

        {items.map((item) => {
          const on = active === item.id;
          return (
            <li key={item.id}>
              <a
                aria-current={on ? "true" : undefined}
                className={`block font-mono text-rail leading-rail no-underline transition-colors duration-state ease-settle ${
                  on ? "text-ink" : "text-ink-3"
                }`}
                href={`#${item.id}`}
              >
                <span aria-hidden="true">{MARKS[item.mark]}</span>
                {/* 기호의 뜻과 판단 제목이 접근 가능한 이름을 만듭니다. */}
                <span className="sr-only">
                  {item.markLabel} — {item.title}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
