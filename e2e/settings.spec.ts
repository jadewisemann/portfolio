import { expect, test } from "@playwright/test";

/*
  오른쪽 위 설정 — 테마와 서체.

  왜 e2e 인가: 이 기능의 핵심은 **첫 페인트 전에** 값이 적용되는 것이다
  (`src/lib/preferences.ts` 의 BOOT_SCRIPT). 단위 테스트로는 그 순간을 볼 수 없다.
  저장된 값이 라이트인 사람이 첫 프레임에 다크를 보고 하이드레이션 뒤에 뒤집히는
  결함은 브라우저에서만 잡힌다.
*/

test("설정을 열어 라이트로 바꾸면 지면이 밝아진다", async ({ page }) => {
  await page.goto("/");

  const ground = () =>
    page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--ground").trim(),
    );

  await page.getByRole("button", { name: "설정" }).click();
  await page.getByRole("radio", { name: "라이트" }).check();

  expect(await ground()).toBe("#faf7f1");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("고른 테마가 새로고침 뒤에도 첫 페인트부터 유지된다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "설정" }).click();
  await page.getByRole("radio", { name: "라이트" }).check();

  await page.reload();

  /*
    하이드레이션을 기다리지 않고 본다. `domcontentloaded` 시점에 이미 라이트여야
    한다 — 그 시점에 다크라면 사용자는 흰 화면으로 뒤집히는 것을 본다.
  */
  await page.waitForLoadState("domcontentloaded");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("서체를 바꾸면 본문 글꼴이 실제로 바뀐다", async ({ page }) => {
  await page.goto("/");

  const family = () =>
    page.evaluate(() => getComputedStyle(document.body).fontFamily);

  const before = await family();

  await page.getByRole("button", { name: "설정" }).click();
  await page.getByRole("radio", { name: "Plex" }).check();
  await page.evaluate(() => document.fonts.ready);

  const after = await family();
  expect(after).not.toBe(before);
  await expect(page.locator("html")).toHaveAttribute("data-font", "plex");
});

test("Escape 로 닫으면 포커스가 설정 버튼으로 돌아온다", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "설정" });

  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});
