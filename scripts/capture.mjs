#!/usr/bin/env node
/**
 * 렌더 증거 캡처 파이프라인.
 *
 * 프로덕션 빌드를 서버로 띄우고(3101 포트) 데스크톱 1440×900 / 모바일 320×640
 * 풀페이지 스크린샷을 지정 디렉터리에 저장합니다. 크리틱·감사 에이전트는 이 스크립트로
 * 증거 파일을 만든 뒤 그 파일을 인용해 리뷰합니다. e2e 와 같은 이유로 dev 서버가 아니라
 * 프로덕션 빌드를 검증합니다.
 *
 * 사용법:
 *   node scripts/capture.mjs <출력디렉터리> [--skip-build] [--path /route]
 * 예:
 *   node scripts/capture.mjs review/golden-slice
 */
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { chromium } from "@playwright/test";

const PORT = 3101;
const args = process.argv.slice(2);
const outDir = args.find((a) => !a.startsWith("--"));
const skipBuild = args.includes("--skip-build");
const route = args[args.indexOf("--path") + 1] && args.includes("--path") ? args[args.indexOf("--path") + 1] : "/";

if (!outDir) {
  console.error("사용법: node scripts/capture.mjs <출력디렉터리> [--skip-build] [--path /route]");
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

if (!skipBuild) {
  console.log("$ npm run build");
  const build = spawnSync("npm run build", { shell: true, stdio: "inherit" });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const server = spawn(`npm run start -- --port ${PORT}`, { shell: true, stdio: "pipe" });
const kill = () => {
  // Windows 에서 npm 쉘 자식까지 확실히 정리한다.
  spawnSync(`taskkill /pid ${server.pid} /T /F`, { shell: true, stdio: "ignore" });
};
process.on("exit", kill);

async function waitForServer(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* 서버가 아직 안 떴다 — 재시도 */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`서버가 ${timeoutMs}ms 안에 뜨지 않았습니다: ${url}`);
}

const url = `http://localhost:${PORT}${route}`;
await waitForServer(`http://localhost:${PORT}/`);

const viewports = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-320", width: 320, height: 640 },
];
const slug = route === "/" ? "home" : route.replace(/\W+/g, "-").replace(/^-|-$/g, "");

const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const vp of viewports) {
    for (const reducedMotion of ["no-preference", "reduce"]) {
      const page = await browser.newPage({
        viewport: { width: vp.width, height: vp.height },
        reducedMotion,
      });
      await page.goto(url, { waitUntil: "networkidle" });
      // 스크롤 트리거 요소가 관측되도록 끝까지 스크롤 후 복귀
      await page.evaluate(async () => {
        for (let y = 0; y <= document.body.scrollHeight; y += 400) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(400);
      const suffix = reducedMotion === "reduce" ? "-reduced-motion" : "";
      const file = path.join(outDir, `${slug}-${vp.name}${suffix}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`캡처: ${file}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  kill();
}
console.log(`완료 — 증거는 ${outDir}/ 에 있습니다.`);
