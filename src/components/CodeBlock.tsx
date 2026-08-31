/**
 * 코드 블록. **구문 하이라이팅을 하지 않습니다.**
 *
 * 왜: DESIGN_SYSTEM.md 3절과 ART_DIRECTION.md 3.13 이 `--signal-*` 를 "정의가 있는 색이고 장식으로 쓰면 위반"으로
 * 못박았습니다. 구문 색은 이 사이트에서 아무 의미가 없는 색이므로 팔레트가 그것을 담을 수
 * 없습니다. 대신 주석 줄만 `--ink-3` 로 내려 본문과 구별합니다.
 * COMPONENT_REGISTRY.md 의 「빌드 시점 Shiki」 결정을 이 근거로 폐기했습니다 —
 * 하이라이팅을 하지 않으므로 의존성 자체가 필요하지 않습니다.
 *
 * 가로 스크롤은 자기 컨테이너 안에서만 일어나고 페이지 본문은 넘치지 않습니다.
 * 코드는 선택 가능하고 복사 가능하며 스크린리더가 읽습니다.
 */
export function CodeBlock({
  caption,
  code,
  commentPrefix = "//",
}: {
  caption: string;
  code: string;
  commentPrefix?: string;
}) {
  const lines = code.replace(/\n$/, "").split("\n");

  return (
    <figure className="border-y border-rule bg-ground-sub">
      <div
        aria-label={caption}
        className="scroll-x px-4 py-3"
        role="region"
        tabIndex={0}
      >
        <pre className="font-mono text-mono leading-mono">
          <code>
            {lines.map((line, i) => (
              <span
                className={
                  line.trimStart().startsWith(commentPrefix)
                    ? "block text-ink-3"
                    : "block"
                }
                key={i}
              >
                {line === "" ? " " : line}
              </span>
            ))}
          </code>
        </pre>
      </div>
      <figcaption className="border-t border-rule px-4 py-2 font-mono text-note leading-5 text-ink-3">
        {caption}
      </figcaption>
    </figure>
  );
}
