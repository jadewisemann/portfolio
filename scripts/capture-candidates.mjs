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

/*
  잉크를 두 가지로 잰다. 하나로는 판정이 안 된다.

  - `paintedSharePct` — **PNG 에서 실제로 칠해진 픽셀의 비율.** 정직한 값.
  - `enclosedFormSharePct` — 요소 바운딩 박스가 덮는 비율. 눈이 「덩어리」로 통합하는 양.

  왜 둘인가 (2026-08-31, STRUCTURAL_BRANCH):

  처음에는 바운딩 박스만 쟀다. 그 구현은 `svg` · `canvas` 를 통째로 더하므로
  **아무것도 칠하지 않은 전폭 svg 가 100% 로 잡힌다.** 실제로 /c1 은 성긴 점 필드인데
  59.3% 로, /c3 은 활자 네 줄인데 71.2% 로 보고됐다. 이 지표만 보고 고르면 가장 빈
  후보가 이긴다 — 정확히 반대 방향의 실패다.

  칠해진 픽셀은 스크린샷을 다시 브라우저로 넣어 캔버스에서 센다. 새 의존성 없이
  가능하고, 렌더된 결과를 재는 것이므로 DOM 휴리스틱이 개입하지 않는다.
*/

/** 스크린샷 PNG 를 캔버스로 다시 읽어 칠해진 픽셀을 센다. */
async function measurePainted(browser, pngBuffer) {
  const page = await browser.newPage();
  try {
    await page.setContent(
      `<img id="s" src="data:image/png;base64,${pngBuffer.toString("base64")}">`,
    );
    await page.locator("#s").waitFor({ state: "attached" });
    return await page.evaluate(async () => {
      const img = document.getElementById("s");
      if (!img.complete) await img.decode();
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, w, h);

      // 지면색은 「가장 흔한 색」이다. 라이트/다크를 가정하지 않는다.
      const tally = new Map();
      for (let i = 0; i < data.length; i += 4) {
        const key = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
        tally.set(key, (tally.get(key) ?? 0) + 1);
      }
      let ground = 0;
      let best = -1;
      for (const [key, n] of tally) {
        if (n > best) {
          best = n;
          ground = key;
        }
      }
      const gr = (ground >> 16) & 255;
      const gg = (ground >> 8) & 255;
      const gb = ground & 255;

      /*
        임계를 둘로 나눈다. 하나로는 못 잰다.

        기각된 슬라이스를 임계 6 하나로 재면 1920 에서 칠해짐 6.67% · 빈 띠 0% 가
        나온다. 눈으로는 우측 58.3% 가 비어 있는 화면인데도 그렇다. 원인은 28px 괘선
        기판이다 — 대비 1.18:1 로 사실상 보이지 않는데 픽셀로는 전폭에 칠해져 있다.
        보이지 않는 잉크가 빈 공간을 메워 준 것으로 집계되면 계측이 결함을 감춘다.

        - faint  (diff > 6)  — 기판 · 헤어라인 · 안티에일리어싱 포함, 「무언가 있다」
        - strong (diff > 64) — 눈에 확실히 잡히는 표시. 구도 판정은 이쪽으로 한다.
      */
      const FAINT = 6;
      const STRONG = 64;
      const BAND = 160;
      const bandCount = Math.ceil(w / BAND);
      const bandFaint = new Array(bandCount).fill(0);
      const bandStrong = new Array(bandCount).fill(0);
      let faint = 0;
      let strong = 0;

      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          const i = (y * w + x) * 4;
          const diff = Math.max(
            Math.abs(data[i] - gr),
            Math.abs(data[i + 1] - gg),
            Math.abs(data[i + 2] - gb),
          );
          if (diff <= FAINT) continue;
          const band = Math.floor(x / BAND);
          faint += 1;
          bandFaint[band] += 1;
          if (diff > STRONG) {
            strong += 1;
            bandStrong[band] += 1;
          }
        }
      }

      const bands = bandFaint.map((n, i) => {
        const x0 = i * BAND;
        const x1 = Math.min(x0 + BAND, w);
        const area = (x1 - x0) * h;
        return {
          x0,
          x1,
          faintPct: +((n / area) * 100).toFixed(3),
          strongPct: +((bandStrong[i] / area) * 100).toFixed(3),
        };
      });

      return {
        paintedSharePct: +((faint / (w * h)) * 100).toFixed(2),
        strongInkSharePct: +((strong / (w * h)) * 100).toFixed(2),
        // 눈에 잡히는 표시가 거의 없는 띠. 기각된 슬라이스의 58.3% 가 여기에 해당한다.
        emptyBandSharePct: +(
          (bands.filter((b) => b.strongPct < 0.05).length / bands.length) * 100
        ).toFixed(1),
        // 어떤 잉크도 없는 띠 (기판조차 없음).
        blankBandSharePct: +(
          (bands.filter((b) => b.faintPct === 0).length / bands.length) * 100
        ).toFixed(1),
        paintedBands: bands,
      };
    });
  } finally {
    await page.close();
  }
}

/** 요소 바운딩 박스가 덮는 비율과 활자 급수. 눈이 통합하는 「덩어리」 쪽. */
const measureForm = () => {
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

  // 첫 화면의 글자 예산. 이름 하나만 허용되므로 문자 수를 센다.
  let visibleChars = 0;
  for (const el of document.querySelectorAll("main *, header *, nav *")) {
    if (el.children.length > 0) continue;
    const t = el.textContent?.trim();
    if (!t) continue;
    const r = el.getBoundingClientRect();
    if (r.top >= innerHeight || r.bottom <= 0 || r.width === 0) continue;
    visibleChars += t.replace(/\s+/g, "").length;
  }

  return {
    viewport: { w: innerWidth, h: innerHeight },
    screens: +(document.documentElement.scrollHeight / innerHeight).toFixed(2),
    enclosedFormSharePct: +total.toFixed(2),
    largestTypePx: +maxFontPx.toFixed(1),
    firstScreenChars: visibleChars,
    horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - innerWidth),
    formBands: bands,
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
          const ink = {
            ...(await page.evaluate(measureForm)),
            ...(await measurePainted(browser, buf)),
          };
          report[route][vp.name] = ink;
          fs.writeFileSync(
            path.join(outDir, `ink-${slug(route)}-${vp.name}.json`),
            JSON.stringify(ink, null, 2),
          );
          console.log(
            `${route} ${vp.name}: 진한 잉크 ${ink.strongInkSharePct}% · 옅은 것 포함 ${ink.paintedSharePct}% · ` +
              `덩어리 ${ink.enclosedFormSharePct}% · 빈 띠 ${ink.emptyBandSharePct}% · ` +
              `최대 활자 ${ink.largestTypePx}px · 글자 ${ink.firstScreenChars}자 · ` +
              `넘침 ${ink.horizontalOverflowPx}px`,
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
