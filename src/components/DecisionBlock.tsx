import { MARKS, type Mark } from "@/lib/gutter";
import { EvidenceNote, type EvidenceLink } from "./EvidenceNote";
import type { Grade } from "@/lib/reading";

/**
 * 판단 블록. 고정 5부 형태입니다 (ART_DIRECTION.md 3.8).
 *   판단 / 산출물 / 왜 / 대가 / 근거
 *
 * `why` 가 필수입니다. **왜 칸이 비면 그 판단은 사이트에 넣지 않습니다.**
 * 타입이 이 규칙을 강제합니다.
 *
 * `cost` 는 없을 수 있습니다 — 없으면 칸 자체를 만들지 않습니다.
 */
export function DecisionBlock({
  id,
  mark,
  markLabel,
  title,
  why,
  cost,
  grade,
  gradeLabel,
  links,
  children,
}: {
  id: string;
  mark: Mark;
  /** 기호의 뜻. 접근 가능한 이름에 들어갑니다. */
  markLabel: string;
  title: string;
  /** 근본 이유. 비워둘 수 없습니다. */
  why: string;
  cost?: string;
  grade: Grade;
  gradeLabel: string;
  links: readonly EvidenceLink[];
  /** 산출물. 없을 수 있습니다. */
  children?: React.ReactNode;
}) {
  return (
    <section
      // 기호의 뜻을 접근 가능한 이름에 넣습니다. 기호 글리프는 aria-hidden 이므로
      // 이것이 없으면 스크린리더 사용자가 이 사이트의 축(막았다 / 세웠다 / …)을
      // 전혀 얻지 못합니다. 접근성 감사에서 최대 결함으로 지적된 지점입니다.
      aria-labelledby={`${id}-mark ${id}-title`}
      // 거터가 이 속성을 읽어 현재 기호를 정합니다 (Gutter.tsx).
      data-mark={mark}
      id={id}
      // 모바일 거터는 3px 왼쪽 경계선과 인라인 기호입니다 (ART_DIRECTION.md 3.17).
      // iteration 1 에서 이 경계선이 없어 모바일에 척추가 없다는 지적을 받았습니다.
      className="border-l-[3px] border-t border-rule pl-4 pt-7 md:border-l-0 md:pl-0 md:flex md:gap-8"
    >
      {/* 모바일 거터: 인라인 기호. 정적 마크업이고 관찰자를 쓰지 않습니다. */}
      <p className="w-gutter shrink-0 font-mono text-mark leading-mono text-ink-3 md:text-right">
        <span aria-hidden="true">{MARKS[mark]}</span>
        {/* 기호의 뜻. 화면에는 보이지 않고 접근 가능한 이름에만 들어갑니다. */}
        <span className="sr-only" id={`${id}-mark`}>
          {markLabel}
        </span>
      </p>

      <div className="min-w-0 max-w-measure flex-1">
        <h2
          className="font-semibold leading-[1.5] text-decision"
          id={`${id}-title`}
          tabIndex={-1}
        >
          {title}
        </h2>

        {children ? <div className="mt-6">{children}</div> : null}

        <p className="mt-6">{why}</p>
        {cost ? <p className="mt-4 text-ink-2">{cost}</p> : null}
      </div>

      <div className="md:w-64 md:shrink-0">
        <EvidenceNote grade={grade} gradeLabel={gradeLabel} links={links} />
      </div>
    </section>
  );
}
