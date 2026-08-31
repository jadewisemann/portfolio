import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * 모션 토큰의 정본은 `docs/portfolio/MOTION_LANGUAGE.md` 3·4절이고 구현은
 * `src/app/globals.css` 의 `:root` 다. 이 테스트는 둘이 어긋나면 실패한다.
 *
 * 왜 필요한가: GOLDEN_FIX 1 에서 `--ease-spine` · `--duration-spine` ·
 * `--duration-hold` 셋이 문서에 신설됐는데 CSS 에는 들어오지 않았다. 그 셋을 인용한
 * 곳은 `SpineV1.tsx` 와 `SpineV2.tsx` 의 **주석 두 줄**뿐이었다. 즉 「단일 상한을
 * 폐기하고 시간적 위계로 간다」는 개정 전체가 한 줄도 실행되지 않은 채 잠긴 문서로만
 * 존재했고, 아무 검사도 그것을 잡지 않았다.
 *
 * 문단을 하나 더 쓰는 대신 게이트를 건다 (`CLAUDE.md`).
 */
const root = path.join(import.meta.dirname, "..");
const css = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
const spec = fs.readFileSync(
  path.join(root, "docs/portfolio/MOTION_LANGUAGE.md"),
  "utf8",
);

/** `| \`--token\` | 값 | ... |` 형태의 표 행에서 토큰과 값을 뽑는다. */
function declaredInSpec(prefix: string): Map<string, string> {
  const found = new Map<string, string>();
  const row = new RegExp(
    "^\\|\\s*`(--" + prefix + "-[a-z-]+)`\\s*\\|\\s*`?([^|`]+?)`?\\s*\\|",
    "gm",
  );
  for (const m of spec.matchAll(row)) found.set(m[1], m[2].trim());
  return found;
}

/** CSS `:root` 에 선언된 값. */
function definedInCss(token: string): string | null {
  const m = css.match(new RegExp(`\\n\\s*${token}:\\s*([^;]+);`));
  return m ? m[1].trim() : null;
}

describe("모션 토큰은 문서와 CSS 가 일치한다", () => {
  const easings = declaredInSpec("ease");
  const durations = declaredInSpec("duration");

  it("문서가 이징 3개와 지속 시간 5개를 선언한다", () => {
    // 개수가 줄면 위계가 되돌려졌다는 뜻이므로 여기서 먼저 걸린다.
    expect([...easings.keys()].sort()).toEqual([
      "--ease-settle",
      "--ease-spine",
      "--ease-travel",
    ]);
    expect([...durations.keys()].sort()).toEqual([
      "--duration-contrast",
      "--duration-hold",
      "--duration-sort",
      "--duration-spine",
      "--duration-state",
    ]);
  });

  it.each([...easings, ...durations])(
    "%s 가 CSS 에 같은 값으로 존재한다",
    (token, value) => {
      expect(definedInCss(token), `${token} 이 globals.css 에 없다`).toBe(value);
    },
  );

  it("문서에 없는 이징·지속 시간 토큰을 CSS 가 만들어 쓰지 않는다", () => {
    // 「네 번째 이징은 추가하지 않는다」(§3) 를 기계로 지킨다.
    const inCss = [...css.matchAll(/\n\s*(--(?:ease|duration)-[a-z-]+):/g)].map(
      (m) => m[1],
    );
    const declared = new Set([...easings.keys(), ...durations.keys()]);
    expect(inCss.filter((t) => !declared.has(t))).toEqual([]);
  });
});
