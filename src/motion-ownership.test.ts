import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

// MOTION_LANGUAGE.md 12.2 의 게이트입니다.
//
// 왜 소스 grep 인가: 모션 소유권 위반은 런타임에 조용히 일어납니다. 두 시스템이 같은
// 인라인 스타일에 값을 쓰면 마지막에 쓴 쪽이 이기고, 그것은 테스트가 아니라 눈으로만
// 보입니다. 그래서 위반을 만들 수 있는 임포트와 문자열 자체를 금지합니다.
//
// 오탐이 잦은 게이트는 곧 무력화되므로, 디렉터가 motion-architect 의 제안 목록에서
// `scale(`·`rotate(`·`skew(` 문자열 금지와 앱 소스 rAF 금지를 뺐습니다.
// 정적 SVG 의 transform 속성과 주석에서 오탐이 나기 쉽습니다.
// 그 금지는 MOTION_LANGUAGE.md 8절의 문서 규칙으로만 유지합니다.

// `globSync` 는 Node 26 런타임에는 있으나 @types/node@20 타이핑에 없어 tsc 가 막는다.
// readdirSync 의 recursive 옵션은 타입에 있으므로 그것을 쓴다.
// Windows 는 역슬래시로 돌려주므로 정규화한다 — 허용 목록 비교가 여기에 걸린다.
/**
 * 주석을 걷어냅니다.
 *
 * 왜 필요한가: 이 게이트를 처음 돌렸을 때 `globals.css` 의 주석
 * "will-change 를 쓰지 않고" 와 "scroll-behavior 는 쓰지 않습니다" 를 잡아 실패했습니다.
 * grep 은 사용과 언급을 구분하지 못합니다. 패턴을 하나씩 조이는 대신 주석을 없앱니다 —
 * 그래야 규칙을 새로 추가할 때마다 같은 오탐을 다시 만들지 않습니다.
 *
 * ponytail: `//` 는 앞에 `:` 가 없을 때만 지웁니다. 문자열 안의 `https://` 를 보호하기
 * 위한 것이고, 문자열 리터럴을 제대로 파싱하지는 않습니다. 오탐이 다시 생기면
 * 그때 파서를 넣습니다.
 */
function stripComments(text: string): string {
  return text
    // 여러 줄 주석은 개행을 남겨야 실패 보고의 줄 번호가 어긋나지 않습니다.
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const files = readdirSync("src", { recursive: true, encoding: "utf8" })
  .map((p) => `src/${p.replaceAll("\\", "/")}`)
  .filter((p) => /\.(ts|tsx|css)$/.test(p) && !p.includes(".test."))
  .map((path) => ({
    path,
    text: stripComments(readFileSync(path, "utf8")),
  }));

/** 각 파일에서 패턴에 걸리는 곳을 `경로:줄` 로 모은다. */
function hits(pattern: RegExp): string[] {
  const found: string[] = [];
  for (const { path, text } of files) {
    text.split("\n").forEach((line, i) => {
      if (pattern.test(line)) found.push(`${path}:${i + 1}  ${line.trim()}`);
    });
  }
  return found;
}

describe("모션 소유권", () => {
  test("검사 대상 파일이 실제로 발견된다", () => {
    // 이 단정이 없으면 glob 이 0개를 돌려줄 때 아래 모든 테스트가 조용히 통과합니다.
    // 거짓 통과가 게이트의 가장 위험한 실패 방식입니다.
    expect(files.length).toBeGreaterThan(3);
    expect(files.some((f) => f.path.endsWith(".tsx"))).toBe(true);
    expect(files.some((f) => f.path.endsWith(".css"))).toBe(true);
  });

  test("삭제한 라이브러리를 다시 임포트하지 않는다", () => {
    // MOTION_LANGUAGE.md 1.2 · 1.3. 스크롤 오프셋의 함수인 속성이 0개이므로 소비자가 없다.
    expect(hits(/from\s+["'](gsap|lenis)(\/|["'])/)).toEqual([]);
  });

  test("package.json 에 gsap 과 lenis 가 없다", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const all = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(Object.keys(all)).not.toContain("gsap");
    expect(Object.keys(all)).not.toContain("lenis");
  });

  test("Motion 으로 스크럽을 재발명하지 않는다", () => {
    // MOTION_LANGUAGE.md 12.1 의 3번. GSAP 삭제 후 가장 그럴듯해 보이는 우회이고,
    // COMPONENT_REGISTRY.md 가 Aceternity Container Scroll Animation 을 반려한 바로 그 위반이다.
    expect(hits(/\b(useScroll|useTransform|scrollYProgress)\b/)).toEqual([]);
  });

  test("transition-all 을 쓰지 않는다", () => {
    // transform 을 포함하므로 Motion 의 layout 서브트리에서 인라인 값과 경쟁한다.
    expect(hits(/transition-all|transition-property:\s*all/)).toEqual([]);
  });

  test("will-change 를 쓰지 않는다", () => {
    // 투기적 컴포지팅 레이어를 만들지 않는다. 배경 괘선 모아레 완화책의 요구사항이다.
    expect(hits(/will-change/)).toEqual([]);
  });

  test("스스로 시작하는 애니메이션이 없다", () => {
    // 키프레임은 정의상 사용자 행동 없이 시작하므로 MOTION_LANGUAGE.md 2절 위반이다.
    // 0 으로 두면 그 부류의 결함이 발생할 수 없다.
    expect(hits(/@keyframes|animation-name|\banimation:/)).toEqual([]);
  });

  test("블러를 쓰지 않는다", () => {
    expect(hits(/filter:\s*blur|backdrop-filter|backdrop-blur/)).toEqual([]);
  });

  test("바깥으로 나가는 그림자가 없다", () => {
    // DESIGN_SYSTEM.md 2절. box-shadow 의 유일한 허용 형태는 inset 이다.
    const shadows = hits(/box-shadow:/).filter((h) => !h.includes("inset"));
    expect(shadows).toEqual([]);
  });

  test("scroll-behavior 를 쓰지 않는다", () => {
    // MOTION_LANGUAGE.md 5.3. 소유할 수 없는 지속 시간은 소유권 규칙에 어긋난다.
    // `overscroll-behavior` 는 가로 스크롤 컨테이너에 **필요한** 속성이므로 제외한다
    // (DESIGN_SYSTEM.md 5절). 부분 일치로 그것까지 잡던 것을 고쳤다.
    expect(hits(/(?<!over)scroll-behavior\s*:/)).toEqual([]);
  });

  test("Motion 애니메이션 props 가 허용 목록 밖에 없다", () => {
    // MOTION_LANGUAGE.md 12절 표에 따라 Motion 이 소유하는 것은 C1(히어로)과 S2(트리)뿐이다.
    // 파일이 생기면 여기에 추가하고, 추가할 때 12절 표도 함께 고친다.
    const allowed = ["src/components/Hero", "src/components/DirTree"];
    const offenders = hits(/<motion\.|\blayout\b\s*(=|\/?>)|initial=\{/).filter(
      (h) => !allowed.some((a) => h.startsWith(a)),
    );
    expect(offenders).toEqual([]);
  });
});
