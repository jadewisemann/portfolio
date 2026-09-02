import { expect, test } from "@playwright/test";

/** 기하 판정. 스크린샷 비교를 쓰지 않습니다. 콘텐츠와 무관한 불변식만 남겼습니다. */
test("본문이 가로로 스크롤되지 않고 넘치는 요소가 없다", async ({ page }) => {
  await page.goto("/");

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
