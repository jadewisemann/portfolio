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

/*
  뷰포트 1920 을 추가한 사유 (2026-09-01, GOLDEN_FIX 1): 1440 만 찍었더니 1920 에서
  첫 뷰포트의 58.3% 에 잉크가 0인 상태가 심사에 걸리지 않았다. 중앙 정렬 컬럼의 결함은
  넓은 화면에서만 드러난다.
*/
const viewports = [
  { name: "wide-1920", width: 1920, height: 1080 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-320", width: 320, height: 640 },
];

/*
  다크 캡처를 추가한 사유: DESIGN_SYSTEM.md 3절이 다크를 「두 번째 문서 상태」로 따로
  설계했는데 증거가 0장이어서 심사 자체가 불가능했다.
*/
const schemes = ["light", "dark"];
const slug = route === "/" ? "home" : route.replace(/\W+/g, "-").replace(/^-|-$/g, "");

const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const vp of viewports) {
    for (const colorScheme of schemes) {
      for (const reducedMotion of ["no-preference", "reduce"]) {
        // 다크는 축소 모션 변형을 만들지 않는다 — 조합 폭발을 막고, 축소 모션 판정은
        // 라이트에서 한다 (색이 아니라 이동이 판정 대상이므로).
        if (colorScheme === "dark" && reducedMotion === "reduce") continue;

        const page = await browser.newPage({
          viewport: { width: vp.width, height: vp.height },
          reducedMotion,
          colorScheme,
        });
        await page.goto(url, { waitUntil: "networkidle" });

        const parts = [
          colorScheme === "dark" ? "-dark" : "",
          reducedMotion === "reduce" ? "-reduced-motion" : "",
        ].join("");

        /*
          첫 뷰포트 한 컷을 별도로 남긴다. fullPage 만 찍으면 10초 독자가 실제로 보는
          프레임이 증거에 없고, iteration 0 에서 96px 비율 숫자가 y=895 로 900px 뷰포트
          밖에 있다는 사실이 잡히지 않았다.
        */
        await page.waitForTimeout(600);
        const firstFile = path.join(
          outDir,
          `first-viewport-${vp.name}${parts}.png`,
        );
        await page.screenshot({ path: firstFile });
        console.log(`캡처: ${firstFile}`);

        /*
          첫 뷰포트의 잉크 분포를 160px 세로 띠로 계측한다. 「중앙 정렬 컬럼 옆의
          거대한 빈 공간」은 스크린샷을 봐도 놓치기 쉽고 수치로는 즉시 드러난다.
        */
        const ink = await page.evaluate(() => {
          const vw = innerWidth;
          const bands = [];
          for (let x0 = 0; x0 < vw; x0 += 160) {
            const x1 = Math.min(x0 + 160, vw);
            let area = 0;
            for (const el of document.querySelectorAll("main *, nav *, header *")) {
              const t = el.textContent;
              if (!t || !t.trim()) continue;
              if (el.children.length > 0) continue;
              const r = el.getBoundingClientRect();
              if (r.top >= innerHeight || r.bottom <= 0 || r.width === 0) continue;
              const ox = Math.max(0, Math.min(r.right, x1) - Math.max(r.left, x0));
              const oy = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
              area += ox * oy;
            }
            bands.push({
              x0,
              x1,
              share: +((area / ((x1 - x0) * innerHeight)) * 100).toFixed(2),
            });
          }
          return {
            viewport: { w: innerWidth, h: innerHeight },
            screens: +(document.documentElement.scrollHeight / innerHeight).toFixed(2),
            zeroInkBandShare: +(
              (bands.filter((b) => b.share === 0).length / bands.length) * 100
            ).toFixed(1),
            bands,
          };
        });
        fs.writeFileSync(
          path.join(outDir, `ink-${vp.name}${parts}.json`),
          JSON.stringify(ink, null, 2),
        );
        console.log(
          `  잉크: ${vp.name}${parts} 빈 띠 ${ink.zeroInkBandShare}% · ${ink.screens} 화면`,
        );

        // 스크롤 트리거 요소가 관측되도록 끝까지 스크롤 후 복귀
        await page.evaluate(async () => {
          for (let y = 0; y <= document.body.scrollHeight; y += 400) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 60));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(400);
        const file = path.join(outDir, `${slug}-${vp.name}${parts}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log(`캡처: ${file}`);
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
  kill();
}
console.log(`완료 — 증거는 ${outDir}/ 에 있습니다.`);
