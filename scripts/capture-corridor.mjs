#!/usr/bin/env node
/**
 * 복도(corridor) 밀도 재설계 검증용 임시 캡처. 0/20/40/60/80/100% 스크롤 위치를
 * 1920 · 1440 · 320 뷰포트에서 찍어 `review/corridor/` 에 저장한다.
 *
 * 사용법: node scripts/capture-corridor.mjs [--skip-build]
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  assertPortFree,
  launchChromium,
  startServer,
  waitForServer,
} from "./lib/browser.mjs";

const PORT = 3102;
const outDir = "review/corridor";
const skipBuild = process.argv.includes("--skip-build");
fs.mkdirSync(outDir, { recursive: true });

if (!skipBuild) {
  const build = spawnSync("npm run build", { shell: true, stdio: "inherit" });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

await assertPortFree(PORT);
const { stop } = startServer(PORT);
const url = `http://localhost:${PORT}/`;
await waitForServer(url);

const viewports = [
  { name: "1920", width: 1920, height: 1080 },
  { name: "1440", width: 1440, height: 900 },
  { name: "320", width: 320, height: 640 },
];
const fractions = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

const browser = await launchChromium();
try {
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(url, { waitUntil: "networkidle" });
    // 라이브 갤러리는 768px 이상에서만 존재한다 — e2e/lazy-mount.spec.ts 와 같은
    // 양(4000px)만큼 강제로 스크롤해 IntersectionObserver 마운트 게이트를 넘긴다.
    await page.mouse.wheel(0, 4000);
    if (vp.width >= 768) {
      await page
        .waitForSelector('nav[aria-label="프로젝트로 이동"]', { timeout: 5000 })
        .catch(() => {});
    }
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);

    const geom = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="프로젝트로 이동"]');
      const wrapper = nav?.closest("div")?.parentElement;
      if (!wrapper) return null;
      const rect = wrapper.getBoundingClientRect();
      return { top: window.scrollY + rect.top, height: rect.height };
    });

    for (const frac of fractions) {
      const top = geom
        ? geom.top + frac * Math.max(0, geom.height - vp.height)
        : frac * (await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight));
      await page.evaluate((top) => window.scrollTo(0, top), top);
      await page.waitForTimeout(150);
      const pct = Math.round(frac * 100);
      await page.screenshot({ path: path.join(outDir, `corridor-${vp.name}-${pct}.png`) });
      console.log(`captured corridor-${vp.name}-${pct}.png`);
    }
    await page.close();
  }
} finally {
  await browser.close();
  stop();
}
