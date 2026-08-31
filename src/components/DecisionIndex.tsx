import { MARKS } from "@/lib/gutter";
import type { RailItem } from "./Gutter";

/**
 * 판단 인덱스. 데스크톱에서는 목차이고 **모바일에서는 유일한 내비게이션**입니다.
 * 드로어를 만들지 않습니다 (ART_DIRECTION.md 3.7).
 *
 * 실제 nav + ol + 앵커입니다. scroll-behavior 를 쓰지 않고, 착지는
 * scroll-margin-top 28px 배수로 리듬에 앉습니다.
 */
export function DecisionIndex({
  items,
  label,
  caption,
}: {
  items: readonly RailItem[];
  label: string;
  caption: string;
}) {
  return (
    <nav aria-label={label} className="max-w-measure pb-14">
      <p className="font-mono text-note leading-5 text-ink-3">
        {caption}
      </p>
      <ol className="mt-4">
        {items.map((item) => (
          <li className="border-t border-rule" key={item.id}>
            <a
              className="flex gap-4 py-2 no-underline"
              href={`#${item.id}`}
            >
              <span className="w-4 shrink-0 font-mono text-mark leading-mono text-ink-3">
                <span aria-hidden="true">{MARKS[item.mark]}</span>
                <span className="sr-only">{item.markLabel} — </span>
              </span>
              <span className="underline decoration-1 underline-offset-[3px]">
                {item.title}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
