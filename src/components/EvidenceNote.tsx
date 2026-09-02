import type { Grade } from "@/lib/reading";

/**
 * 주석 트랙 항목. 모든 주장의 증거가 그 주장의 물리적 오른쪽에 놓입니다.
 *
 * `grade` 가 필수이므로 등급 없이 렌더할 수 없습니다 (ART_DIRECTION.md 3.16).
 * 증거를 빼먹으면 그리드에 빈 칸이 보입니다 — 규율을 사람이 아니라 레이아웃이 지킵니다.
 */
export type EvidenceLink = { label: string; href: string };

export function EvidenceNote({
  grade,
  links,
  gradeLabel,
}: {
  grade: Grade;
  gradeLabel: string;
  links: readonly EvidenceLink[];
}) {
  return (
    <aside className="mt-4 font-mono text-note leading-5 text-ink-3 md:mt-0">
      <p>
        {gradeLabel} {grade}
      </p>
      <ul className="mt-1 space-y-1">
        {links.map((l) => (
          <li key={l.href}>
            {/*
              터치 목표 44×44, 예외 없음(DESIGN_SYSTEM.md §7). 실측 216×17 ·
              177×17 — 활자 급수(text-note, 13px)는 그대로 두고 히트 영역만
              min-height · padding 으로 키운다.
            */}
            <a
              className="-mx-2 inline-flex min-h-11 items-center px-2"
              href={l.href}
              rel="noreferrer noopener"
              target="_blank"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
