import type { Grade } from "@/lib/reading";

/**
 * 절 하나의 증거 블록. 랜딩에서 프로젝트 페이지로 넘어온 독자는 근거 전부를 원하지만,
 * 그 근거가 문장마다 회색 각주로 반복되면 페이지 전체가 "각주가 달린 문서"로 읽힌다
 * (redesign 브리프 — 실측: 절당 여러 개, 페이지 전체로는 약 서른 개).
 *
 * 그래서 절 하나에 등급 표시는 **한 번**만 있다. 절 안의 개별 주장이 각자 어떤 문장을
 * 근거하는지는 이 컴포넌트가 여는 `citations` 접힘 안에 모아 둔다 — 펼치지 않으면
 * 보이지 않지만, `<details>` 는 순수 마크업이라 키보드 · 스크린리더 양쪽에서 그대로
 * 열리고 닫힌다(JS 도 애니메이션도 필요 없다).
 *
 * `grade` 가 필수이므로 등급 없이 렌더할 수 없다 (ART_DIRECTION.md 3.16).
 */
export type EvidenceLink = { label: string; href: string };
export type Citation = { label: string; source: string; grade: Grade };

export function EvidenceNote({
  grade,
  links,
  gradeLabel,
  citations,
}: {
  grade: Grade;
  gradeLabel: string;
  links: readonly EvidenceLink[];
  /** 절 안의 개별 주장 근거. 접힌 상태로 시작한다 — 지면 위의 기본 상태는 산문이다. */
  citations?: readonly Citation[];
}) {
  return (
    <aside className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-note text-ink-3">
      <p>
        {gradeLabel} {grade}
      </p>
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {links.map((l) => (
          <li key={l.href}>
            {/*
              터치 목표 44×44, 예외 없음(DESIGN_SYSTEM.md §7). 활자 급수(text-note,
              13px)는 그대로 두고 히트 영역만 min-height · padding 으로 키운다.
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
      {citations && citations.length > 0 ? (
        <details className="min-w-0">
          <summary className="-mx-2 -my-2 inline-flex min-h-11 cursor-pointer list-none items-center gap-1 px-2 [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true">＋</span>
            근거 보기
          </summary>
          <dl className="mt-2 flex max-w-prose flex-col gap-2 border-t border-rule pt-2">
            {citations.map((c) => (
              <div key={c.label}>
                <dt className="text-ink-2">{c.label}</dt>
                <dd>
                  {c.source} · 등급 {c.grade}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      ) : null}
    </aside>
  );
}
