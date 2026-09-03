import { expect, test, type Page } from "@playwright/test";

/** 기하 판정. 스크린샷 비교를 쓰지 않습니다. 콘텐츠와 무관한 불변식만 남겼습니다. */
async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    /*
      히어로 다이오라마(`HeroPoster.module.css` 의 `.frames`)는 뷰포트보다 넓게
      흩어진 액자를 `overflow: hidden` 조상 안에서 잘라 보여주는 것이 의도된
      구도다(ART_DIRECTION.md — "이미 짜인 3D 구도"). 그런 조상이 있으면 그
      자손의 bounding rect 가 뷰포트를 넘어도 실제로는 화면 밖으로 새지 않는다 —
      진짜 가로 스크롤 여부는 아래 scrollWidth 비교가 가른다. 여기서는 클리핑
      조상이 없는데도 넘치는 요소만 결함으로 본다.
    */
    const isClipped = (el: Element) => {
      let node = el.parentElement;
      while (node && node !== document.body) {
        const style = getComputedStyle(node);
        if (style.overflowX === "hidden" || style.overflowX === "clip") return true;
        node = node.parentElement;
      }
      return false;
    };
    return [...document.querySelectorAll("body *")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0) return false;
        if (el.closest(".scroll-x")) return false;
        // 왼쪽으로 밀어낸 것(스킵 링크)은 LTR 에서 가로 스크롤을 만들지 않습니다.
        if (r.right <= vw + 0.5) return false;
        return !isClipped(el);
      })
      .map((el) => `${el.tagName}.${el.className?.toString().slice(0, 40)}`);
  });

  expect(overflow).toEqual([]);
  const [scrollWidth, clientWidth] = await page.evaluate(() => [
    document.documentElement.scrollWidth,
    document.documentElement.clientWidth,
  ]);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

test("랜딩 — 본문이 가로로 스크롤되지 않고 넘치는 요소가 없다", async ({ page }) => {
  await page.goto("/");
  await assertNoHorizontalOverflow(page);
});

test("스킵 링크가 첫 포커스 가능 요소다", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const focused = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    href: (document.activeElement as HTMLAnchorElement | null)?.getAttribute("href"),
  }));

  expect(focused.tag).toBe("A");
  expect(focused.href).toBe("#main");
});

/*
  /projects/yorr — 긴 글 페이지는 측정폭을 넘기거나 표 · SVG 다이어그램이 320px 에서
  넘치기 쉽다. 랜딩과 같은 기하 판정을 그대로 재사용한다(스크린샷 비교가 아니라
  요소 위치 · scrollWidth 로 판정 — CONTENT.md §2.4 가 소개하는 narrow-width.spec.ts
  의 방법과 같다. 같은 방법을 이 사이트 자신에도 쓰지 않으면 그 절의 포지셔닝이
  반증된다).
*/
test("프로젝트 페이지(YORR) — 본문이 가로로 스크롤되지 않고 넘치는 요소가 없다", async ({
  page,
}) => {
  await page.goto("/projects/yorr");
  await assertNoHorizontalOverflow(page);
});

test("프로젝트 페이지(YORR) — 랜딩으로 돌아가는 링크가 있다", async ({ page }) => {
  await page.goto("/projects/yorr");
  const back = page.getByRole("link", { name: "← 처음으로" }).first();
  await expect(back).toHaveAttribute("href", "/");
});

/*
  서체 조합 × 넘침.

  히어로 이름(`jadewisemann`)의 급수 계단은 세 조합 중 가장 넓은 것(Grotesk, 급수의
  6.502배)을 기준으로 잡혀 있다(`HeroSection.module.css`). 그 계산이 맞는지는 산술이
  아니라 렌더된 폭으로 판정해야 한다 — 조합을 바꾸면 폭이 바뀌고, 끊을 자리가 없는 한
  낱말이라 줄바꿈으로 도망칠 수도 없다.

  `data-font` 를 직접 세우는 이유: 설정 패널을 여는 것은 이 테스트의 관심사가 아니고,
  그 경로는 아래 settings.spec.ts 가 따로 판정한다.
*/
for (const font of ["grotesk", "serif", "plex"] as const) {
  test(`랜딩 — 서체 ${font} 에서 넘치는 요소가 없다`, async ({ page }) => {
    await page.goto("/");
    await page.evaluate((value) => {
      document.documentElement.dataset.font = value;
    }, font);
    await page.evaluate(() => document.fonts.ready);
    await assertNoHorizontalOverflow(page);
  });
}
