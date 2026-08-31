import { expect, test } from "@playwright/test";

/** 기하 판정. 스크린샷 비교를 쓰지 않습니다. 콘텐츠와 무관한 불변식만 남겼습니다. */
test("본문이 가로로 스크롤되지 않고 넘치는 요소가 없다", async ({ page }) => {
  await page.goto("/");

  const overflow = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    return [...document.querySelectorAll("body *")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0) return false;
        if (el.closest(".scroll-x")) return false;
        // 왼쪽으로 밀어낸 것(스킵 링크)은 LTR 에서 가로 스크롤을 만들지 않습니다.
        return r.right > vw + 0.5;
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
