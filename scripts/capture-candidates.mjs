#!/usr/bin/env node
/**
 * 후보 방향 렌더 증거 캡처 — **동일성 검사가 붙은 파이프라인**.
 *
 * 왜 별도 스크립트인가 (2026-08-31, STRUCTURAL_BRANCH):
 *
 * 직전 런의 히어로 Best-of-N 은 "구조적으로 다른 3안"이라고 보고됐지만, 나중에 md5 로
 * 확인해 보니 **모바일 3안이 바이트 동일**했다. 320px 캡처 3장이 같은 파일이었다는 뜻이고,
 * 그 상태로 모바일 아트 디렉션을 판정했다면 존재하지 않는 차이를 심사한 셈이 된다.
 * 같은 런에서 reduced-motion 캡처가 일반 캡처와 바이트 동일했고, 전환 중간 프레임이
 * 전환 후 프레임과 바이트 동일했다.
 *
 * 사람이 md5 를 다시 대조하기를 기대하는 대신 파이프라인이 거부한다. `CLAUDE.md` 의
 * 「문단을 더 쓰지 말고 게이트를 더 걸어라」를 따른다.
 *
 * 검사 3종 (하나라도 걸리면 종료 코드 1):
 *   1. 후보 간 동일 — 서로 다른 두 후보가 같은 뷰포트에서 같은 픽셀이면 실패
 *   2. 뷰포트 간 동일 — 한 후보의 320 과 1440 이 같으면 실패 (반응형이 아예 없다는 뜻)
 *   3. 축소 모션 동일 — 축소 모션이 일반과 같으면 실패 (설계된 대안이 아니라 결번)
 *
 * 사용법:
 *   node scripts/capture-candidates.mjs <출력디렉터리> --routes /c1,/c2,/c3 [--skip-build]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  assertPortFree,
  launchChromium,
  startServer,
  waitForServer,
} from "./lib/browser.mjs";

const PORT = 3102;
const args = process.argv.slice(2);
const outDir = args.find((a) => !a.startsWith("--"));
const skipBuild = args.includes("--skip-build");
const routesArg = args.includes("--routes") ? args[args.indexOf("--routes") + 1] : null;

if (!outDir || !routesArg) {
  console.error(
    "사용법: node scripts/capture-candidates.mjs <출력디렉터리> --routes /c1,/c2,/c3 [--skip-build]",
  );
  process.exit(1);
}

const routes = routesArg.split(",").map((r) => r.trim()).filter(Boolean);
if (routes.length < 2) {
  console.error("후보가 2개 미만이면 비교할 것이 없습니다.");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const VIEWPORTS = [
  { name: "1920", width: 1920, height: 1080 },
  { name: "1440", width: 1440, height: 900 },
  { name: "320", width: 320, height: 640 },
];

if (!skipBuild) {
  console.log("$ npm run build");
  const build = spawnSync("npm run build", { shell: true, stdio: "inherit" });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

await assertPortFree(PORT);
const { stop } = startServer(PORT);
await waitForServer(`http://localhost:${PORT}/`);

const md5 = (buf) => crypto.createHash("md5").update(buf).digest("hex");
const slug = (route) => route.replace(/\W+/g, "") || "root";

/** 첫 뷰포트의 잉크 분포. 「중앙 컬럼 옆의 거대한 공백」은 수치로만 즉시 드러난다. */
const measureInk = () => {
  const vw = innerWidth;
  const bands = [];
  for (let x0 = 0; x0 < vw; x0 += 160) {
    const x1 = Math.min(x0 + 160, vw);
    let area = 0;
    for (const el of document.querySelectorAll("main *, nav *, header *, svg, canvas, img")) {
      const isLeaf = el.children.length === 0;
      const hasText = Boolean(el.textContent && el.textContent.trim());
      const isGraphic = ["SVG", "CANVAS", "IMG"].includes(el.tagName);
      if (!isGraphic && !(isLeaf && hasText)) continue;
      const r = el.getBoundingClientRect();
      if (r.top >= innerHeight || r.bottom <= 0 || r.width === 0) continue;
      const ox = Math.max(0, Math.min(r.right, x1) - Math.max(r.left, x0));
      const oy = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
      area += ox * oy;
    }
    bands.push({ x0, x1, share: +((area / ((x1 - x0) * innerHeight)) * 100).toFixed(2) });
  }
  const total = bands.reduce((s, b) => s + b.share * (b.x1 - b.x0), 0) / vw;

  // 지면에서 가장 큰 글자. 히어로가 1920 에서 36px 이던 결함을 수치로 잡는다.
  let maxFontPx = 0;
  for (const el of document.querySelectorAll("main *, header *")) {
    if (el.children.length > 0) continue;
    if (!el.textContent || !el.textContent.trim()) continue;
    const r = el.getBoundingClientRect();
    if (r.top >= innerHeight || r.bottom <= 0) continue;
    maxFontPx = Math.max(maxFontPx, parseFloat(getComputedStyle(el).fontSize));
  }

  return {
    viewport: { w: innerWidth, h: innerHeight },
    screens: +(document.documentElement.scrollHeight / innerHeight).toFixed(2),
    inkSharePct: +total.toFixed(2),
    zeroInkBandSharePct: +(
      (bands.filter((b) => b.share === 0).length / bands.length) * 100
    ).toFixed(1),
    largestTypePx: +maxFontPx.toFixed(1),
    horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - innerWidth),
    bands,
  };
};

const hashes = {}; // route -> { "1920": md5, ... }
const reducedHashes = {}; // route -> md5 at 1440 with reduced motion
const report = {};

const browser = await launchChromium();
try {
  for (const route of routes) {
    hashes[route] = {};
    report[route] = {};
    for (const vp of VIEWPORTS) {
      for (const reducedMotion of ["no-preference", "reduce"]) {
        // 축소 모션은 1440 한 곳에서만 본다 — 판정 대상은 색이 아니라 이동이다.
        if (reducedMotion === "reduce" && vp.name !== "1440") continue;

        const page = await browser.newPage({
          viewport: { width: vp.width, height: vp.height },
          reducedMotion,
        });
        await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(700);

        const suffix = reducedMotion === "reduce" ? "-reduced-motion" : "";
        const file = path.join(
          outDir,
          `first-viewport-${slug(route)}-${vp.name}${suffix}.png`,
        );
        const buf = await page.screenshot({ path: file });

        if (reducedMotion === "reduce") reducedHashes[route] = md5(buf);
        else hashes[route][vp.name] = md5(buf);

        if (reducedMotion === "no-preference") {
          const ink = await page.evaluate(measureInk);
          report[route][vp.name] = ink;
          fs.writeFileSync(
            path.join(outDir, `ink-${slug(route)}-${vp.name}.json`),
            JSON.stringify(ink, null, 2),
          );
          console.log(
            `${route} ${vp.name}: 잉크 ${ink.inkSharePct}% · 빈 띠 ${ink.zeroInkBandSharePct}% · ` +
              `최대 활자 ${ink.largestTypePx}px · 넘침 ${ink.horizontalOverflowPx}px`,
          );

          // 전체 페이지도 남긴다 — 첫 뷰포트만으로는 서사를 못 본다.
          await page.evaluate(async () => {
            for (let y = 0; y <= document.body.scrollHeight; y += 400) {
              window.scrollTo(0, y);
              await new Promise((r) => setTimeout(r, 60));
            }
            window.scrollTo(0, 0);
          });
          await page.waitForTimeout(400);
          await page.screenshot({
            path: path.join(outDir, `full-${slug(route)}-${vp.name}.png`),
            fullPage: true,
          });
        }
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
  stop();
}

// ── 동일성 검사 ────────────────────────────────────────────────────────────
const problems = [];

for (const vp of VIEWPORTS) {
  const seen = new Map();
  for (const route of routes) {
    const h = hashes[route][vp.name];
    if (seen.has(h)) {
      problems.push(
        `${vp.name}px 에서 ${seen.get(h)} 와 ${route} 가 바이트 동일하다 — ` +
          `이 뷰포트에서 두 후보는 서로 다른 방향이 아니다.`,
      );
    } else seen.set(h, route);
  }
}

for (const route of routes) {
  if (hashes[route]["320"] === hashes[route]["1440"]) {
    problems.push(`${route}: 320px 와 1440px 가 바이트 동일하다 — 반응형 자체가 없다.`);
  }
  if (reducedHashes[route] === hashes[route]["1440"]) {
    problems.push(
      `${route}: 축소 모션이 일반과 바이트 동일하다 — 설계된 대안이 아니라 ` +
        `「애니메이션이 로드에 실패한 화면」이다 (MOTION_LANGUAGE.md §13.1).`,
    );
  }
}

fs.writeFileSync(
  path.join(outDir, "candidates.json"),
  JSON.stringify({ routes, hashes, reducedHashes, report, problems }, null, 2),
);

if (problems.length) {
  console.error(`\n증거 결함 ${problems.length}건 — 이 증거로는 판정할 수 없다:`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`\n증거 검사 통과 — ${outDir}/candidates.json`);
