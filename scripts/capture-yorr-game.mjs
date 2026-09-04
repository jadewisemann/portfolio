#!/usr/bin/env node
/**
 * YORR 게임판 캡처 — 랜딩은 `capture-shots.mjs` 가 찍고, 게임판은 방이 필요해서 여기서
 * `/tutorial`(혼자 굴려보기)로 들어가 직접 굴리며 찍는다 (2026-09-04).
 *
 * 출력 (public/shots/yorr/):
 *   mobile-board.png       굴리는 중의 게임판
 *   dice-roll.webm         굴림 4.2초, 주사위 판만 crop — 액자 안에서 gif 처럼 반복 재생된다
 *   dice-roll-poster.png   굴림이 멎은 프레임. 축소 모션에서는 이것만 보인다
 *
 * ffmpeg 는 Playwright 가 받아 둔 것을 쓴다 (VP8 만 있고 gif 인코더는 없다).
 * 사용법: node scripts/capture-yorr-game.mjs
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public/shots/yorr");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "yorr-"));
fs.mkdirSync(OUT, { recursive: true });

const ffmpeg = fs
  .readdirSync(path.join(os.homedir(), "AppData/Local/ms-playwright"))
  .filter((d) => d.startsWith("ffmpeg"))
  .map((d) => path.join(os.homedir(), "AppData/Local/ms-playwright", d, "ffmpeg-win64.exe"))
  .find((f) => fs.existsSync(f));
if (!ffmpeg) {
  console.error("Playwright 의 ffmpeg 가 없다 — npx playwright install ffmpeg");
  process.exit(1);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  recordVideo: { dir: TMP, size: { width: 390, height: 844 } },
});
const t0 = Date.now();
const page = await ctx.newPage();
await page.goto("https://www.yorr.site/tutorial", { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(3000);
const start = page.getByRole("button", { name: "시작하기", exact: true });
if (await start.count()) await start.click();
await page.waitForTimeout(2500);

const roll = page.getByRole("button", { name: /^굴리기$/ }).first();
const rollAt = (Date.now() - t0) / 1000;
await roll.click();
await page.waitForTimeout(1200);
await page.screenshot({ path: path.join(OUT, "mobile-board.png") });
await page.waitForTimeout(3000);
const videoPath = await page.video().path();
await ctx.close();
await browser.close();

// 굴리기 직전 0.35초부터 4.2초. 주사위 판(150 ~ 620px)만 남긴다.
const from = (rollAt - 0.35).toFixed(2);
const crop = "crop=390:470:0:150";
const run = (args) => {
  const r = spawnSync(ffmpeg, ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
run(["-ss", from, "-t", "4.2", "-i", videoPath, "-vf", crop, "-c:v", "libvpx", "-b:v", "1000k", "-auto-alt-ref", "0", "-an", path.join(OUT, "dice-roll.webm")]);
run(["-ss", (rollAt + 3.2).toFixed(2), "-i", videoPath, "-vf", crop, "-frames:v", "1", path.join(OUT, "dice-roll-poster.png")]);

for (const f of fs.readdirSync(OUT)) {
  console.log(`  ${f}  ${Math.round(fs.statSync(path.join(OUT, f)).size / 1024)}KB`);
}
console.log("완료 — public/shots/yorr/");
