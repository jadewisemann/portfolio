#!/usr/bin/env node
/**
 * 인터랙션 상태 캡처. capture.mjs 는 페이지의 정지 상태만 찍습니다 — 시그니처
 * 인터랙션(DirTree 토글)과 포커스 거동은 그 파이프라인에 안 잡힙니다.
 *
 * 크리틱이 "전환을 실제로 관찰"할 수 있도록 다음을 찍습니다:
 *   - 데스크톱 와이드(1920) · 표준(1440) · 모바일(320)
 *   - DirTree 토글 전 / 전이 중(160ms) / 후
 *   - 첫 뷰포트만 잘라낸 컷 (10초 독자가 실제로 보는 것)
 *   - Tab 포커스 링
 *
 * 사용법: node scripts/capture-states.mjs <출력디렉터리> [--port 3101]
 * 서버는 이미 떠 있어야 합니다 (npm run start -- --port 3101).
 */
import fs from "node:fs";
import path from "node:path";
import { launchChromium } from "./lib/browser.mjs";

const args = process.argv.slice(2);
const outDir = args.find((a) => !a.startsWith("--")) ?? "review/golden-slice";
const port = args.includes("--port") ? args[args.indexOf("--port") + 1] : "3101";
const url = `http://localhost:${port}/`;
fs.mkdirSync(outDir, { recursive: true });

const shot = (p) => path.join(outDir, p);
const browser = await launchChromium();

const viewports = [
  { name: "wide-1920", width: 1920, height: 1080 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-320", width: 320, height: 640 },
];

try {
  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
    });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // 10초 독자가 실제로 보는 것: 첫 뷰포트 한 컷 (fullPage 아님).
    await page.screenshot({ path: shot(`first-viewport-${vp.name}.png`) });

    // 히어로 높이와 첫 뷰포트 점유율을 수치로 남긴다.
    const geom = await page.evaluate(() => {
      const q = (s) => document.querySelector(s);
      const rect = (el) => (el ? el.getBoundingClientRect() : null);
      const hero = q("h1") ?? q("[data-hero]");
      const rail = q("[data-rail]") ?? q("nav");
      const seam = q(".seam");
      const num = q(".seam-n");
      const px = (el, prop) =>
        el ? getComputedStyle(el).getPropertyValue(prop) : null;
      return {
        viewport: { w: innerWidth, h: innerHeight },
        docHeight: document.documentElement.scrollHeight,
        screens: +(document.documentElement.scrollHeight / innerHeight).toFixed(2),
        hero: rect(hero) && {
          top: Math.round(rect(hero).top),
          height: Math.round(rect(hero).height),
          width: Math.round(rect(hero).width),
          fontSize: px(hero, "font-size"),
          vhShare: +((rect(hero).height / innerHeight) * 100).toFixed(1),
        },
        railWidthShare: rect(rail)
          ? +((rect(rail).width / innerWidth) * 100).toFixed(2)
          : null,
        railAreaShare: rect(rail)
          ? +(((rect(rail).width * rect(rail).height) /
              (innerWidth * innerHeight)) * 100).toFixed(3)
          : null,
        seamBandWidth: rect(seam) ? Math.round(rect(seam).width) : null,
        biggestType: px(num, "font-size"),
        bodyMeasure: rect(q("main p")) ? Math.round(rect(q("main p")).width) : null,
        // 첫 뷰포트에서 잉크가 실제로 덮는 가로 범위
        inkSpan: (() => {
          const els = [...document.querySelectorAll("main *")].filter((el) => {
            const r = el.getBoundingClientRect();
            return r.top < innerHeight && r.bottom > 0 && r.width > 0 && el.textContent?.trim();
          });
          if (!els.length) return null;
          const left = Math.min(...els.map((e) => e.getBoundingClientRect().left));
          const right = Math.max(...els.map((e) => e.getBoundingClientRect().right));
          return { left: Math.round(left), right: Math.round(right), share: +(((right - left) / innerWidth) * 100).toFixed(1) };
        })(),
      };
    });
    fs.writeFileSync(
      shot(`geometry-${vp.name}.json`),
      JSON.stringify(geom, null, 2),
    );
    console.log(`기하: ${vp.name}`, JSON.stringify(geom.hero), "screens:", geom.screens);

    // 시그니처 인터랙션. 토글 전 / 전이 중 / 후.
    const tree = page.locator(".tree").first();
    if (await tree.count()) {
      await tree.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({ path: shot(`tree-before-${vp.name}.png`) });
      const domainBtn = page.getByRole("button", { name: "도메인 우선" });
      if (await domainBtn.count()) {
        await domainBtn.first().click();
        await page.waitForTimeout(160); // 320ms 전이의 중간
        await page.screenshot({ path: shot(`tree-midtransition-${vp.name}.png`) });
        await page.waitForTimeout(500);
        await page.screenshot({ path: shot(`tree-after-${vp.name}.png`) });
      }
    }

    // 포커스 거동. Tab 3회 후.
    await page.goto(url, { waitUntil: "networkidle" });
    for (let i = 0; i < 3; i += 1) await page.keyboard.press("Tab");
    await page.waitForTimeout(200);
    await page.screenshot({ path: shot(`focus-tab3-${vp.name}.png`) });

    await page.close();
  }

  // 히어로 진입 애니메이션의 초기 프레임 (설계된 오프닝인지 판정용).
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: "commit" });
  await page.waitForTimeout(90);
  await page.screenshot({ path: shot("hero-entry-090ms.png") });
  await page.waitForTimeout(150);
  await page.screenshot({ path: shot("hero-entry-240ms.png") });
  await page.close();
} finally {
  await browser.close();
}
console.log(`완료 — ${outDir}/`);
