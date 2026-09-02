import { expect, test } from "@playwright/test";

/*
  실측 결함: `CorridorGallery` 로더블이 스크롤 없이(`window.scrollY === 0`)
  170~195ms 만에 요청됐다. 래퍼가 `top: 900px`(900px 뷰포트)에 있고 IO
  `rootMargin: "0px 0px -50% 0px"` 뒤에 있으므로 이론상 뷰포트 진입 전에는
  트리거되면 안 되는데, 옵저버의 첫 콜백이 `100dvh` 레이아웃이 자리 잡기 전에
  실행되면서 거짓 양성이 났다 — `setEnhanced(true)` 가 즉시 옵저버를
  disconnect 하므로 그 거짓 양성이 영구히 고정됐다.

  이 테스트는 그 회귀를 막는다: 스크롤 없이 로드했을 때 복도 갤러리(라이브
  씬 — `nav[aria-label="프로젝트로 이동"]` 은 `CorridorGallery` 안에만 있고
  `StaticFallback`·`MobileFilmstrip` 에는 없다)가 마운트되지 않아야 하고,
  실제로 스크롤한 뒤에만 마운트돼야 한다.
*/
test("복도 갤러리 — 스크롤 없이는 마운트되지 않는다", async ({ page }) => {
  // 라이브 갤러리는 768px 이상에서만 존재한다(`useIsWide`) — 그 아래는
  // `MobileFilmstrip` 이 유일한 구성이고 이 회귀와 무관하다.
  const viewport = page.viewportSize();
  test.skip(!viewport || viewport.width < 768, "복도 갤러리는 768px 이상 전용이다");

  await page.goto("/");
  await page.waitForLoadState("load");

  // 버그가 재현되던 시점(로드 후 170~195ms)을 지나도록 여유를 둔다.
  await page.waitForTimeout(400);

  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBe(0);

  const corridorNav = page.locator('nav[aria-label="프로젝트로 이동"]');
  await expect(corridorNav).toHaveCount(0);

  // 실제로 스크롤하면(스크롤 이송을 가로채지 않으므로 브라우저 기본 휠 이벤트)
  // 라이브 갤러리가 마운트돼야 한다 — 게이트 자체가 고장 나서 영영 켜지지
  // 않는 회귀도 함께 잡는다.
  await page.mouse.wheel(0, 4000);
  await expect(corridorNav).toHaveCount(1, { timeout: 5000 });
});
