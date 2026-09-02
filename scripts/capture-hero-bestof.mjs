#!/usr/bin/env node
/**
 * /v1 · /v2 · /v3 (세 공간 모델) 렌더 증거 캡처.
 *
 * 전제: 서버가 이미 떠 있다(`npm run start -- --port 3199`). 빌드/서버 기동은
 * 이 스크립트가 하지 않는다 — 호출하는 쪽이 한다.
 *
 * 산출: review/hero-bestof/ 에
 *   - first-viewport-<v>-<vp>.png (뷰포트 한 컷, fullPage 아님)
 *   - full-<v>-<vp>.png (전체 페이지)
 *   - geometry-<v>-<vp>.json
 *   - spine-mid-<v>-1440.png, spine-before-<v>-1440.png, spine-after-<v>-1440.png
 *   - dark-<v>-1440.png
 */
import fs from "node:fs";
import path from "node:path";
import { launchChromium } from "./lib/browser.mjs";

const BASE = "http://localhost:3199";
const OUT = "review/hero-bestof";
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = ["v1", "v2", "v3"];
const VIEWPORTS = [
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "320x640", width: 320, height: 640 },
];

const SECTION_IDS = [
  "yorr-alone",
  "yorr-restructure",
  "ff-role-boundary",
  "pookjayo-solo",
];

/** 첫 뷰포트의 잉크 분포를 160px 세로 띠로 계측한다 (scripts/capture.mjs 와 같은 기법). */
function inkBandsScript() {
  const vw = innerWidth;
  const bands = [];
  for (let x0 = 0; x0 < vw; x0 += 160) {
    const x1 = Math.min(x0 + 160, vw);
    let area = 0;
    for (const el of document.querySelectorAll("main *")) {
      const t = el.textContent;
      if (!t || !t.trim()) continue;
      if (el.children.length > 0) continue;
      const r = el.getBoundingClientRect();
      if (r.top >= innerHeight || r.bottom <= 0 || r.width === 0) continue;
      const ox = Math.max(0, Math.min(r.right, x1) - Math.max(r.left, x0));
      const oy = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
      area += ox * oy;
    }
    bands.push({ x0, x1, share: +((area / ((x1 - x0) * innerHeight)) * 100).toFixed(2) });
  }
  return bands;
}

async function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`서버가 뜨지 않았습니다: ${url}`);
}

async function geometryFor(page) {
  return page.evaluate(
    ({ bandsFn }) => {
      const vw = innerWidth;
      const vh = innerHeight;
      const h1 = document.querySelector("h1");
      const h1Rect = h1 ? h1.getBoundingClientRect() : null;
      const h1Font = h1 ? getComputedStyle(h1).fontSize : null;

      // 지면에서 가장 큰 활자 — .sp-ratio-label 후보 중 최대 font-size.
      let largest = h1Font ? parseFloat(h1Font) : 0;
      let largestSelector = "h1";
      document.querySelectorAll(".sp-ratio-label, h1").forEach((el) => {
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs > largest) {
          largest = fs;
          largestSelector = el.className || el.tagName;
        }
      });

      // 척추: .sp-spine(v1, 현재 뷰포트에 걸린 것) · .sp-fixed-spine(v2) · .sp-ghost-spine(v3).
      const spineCandidates = Array.from(
        document.querySelectorAll(".sp-spine, .sp-fixed-spine"),
      ).filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top < vh && r.bottom > 0;
      });
      const spineEl = spineCandidates[0] ?? null;
      const spineRect = spineEl ? spineEl.getBoundingClientRect() : null;

      // 320px 에서 모든 절의 colA.h/(colA.h+colB.h) 가 그 절의 실측 비율과 ±2%p
      // 안에 드는지 기하로 판정한다 (브리프 "Assert it" 요구). 편평 절(0%·100%,
      // data-edge 있음)은 두 블록이 아니라 한 덩어리이므로 이 판정에서 뺀다.
      let mobileRatioChecks = null;
      if (vw < 768) {
        mobileRatioChecks = Array.from(
          document.querySelectorAll(".sp-mobile-scene:not([data-edge])"),
        ).map((scene) => {
          const a = scene.querySelector(".sp-mobile-a");
          const b = scene.querySelector(".sp-mobile-b");
          const ah = a ? a.getBoundingClientRect().height : 0;
          const bh = b ? b.getBoundingClientRect().height : 0;
          const expectedPercent = parseFloat(scene.dataset.percent ?? "NaN");
          const actualPercent = ah + bh > 0 ? (ah / (ah + bh)) * 100 : NaN;
          const deltaPp = Math.abs(actualPercent - expectedPercent);
          return {
            id: scene.id,
            colAHeight: ah,
            colBHeight: bh,
            sumHeight: ah + bh,
            expectedPercent,
            actualPercent: +actualPercent.toFixed(2),
            deltaPp: +deltaPp.toFixed(2),
            within2pp: deltaPp <= 2,
          };
        });
      }

      return {
        viewport: { w: vw, h: vh },
        h1: h1Rect
          ? {
              fontSize: h1Font,
              rect: { x: h1Rect.x, y: h1Rect.y, width: h1Rect.width, height: h1Rect.height },
            }
          : null,
        largestTypeSize: largest,
        largestTypeSelector: largestSelector,
        spine: spineRect
          ? {
              x: spineRect.x,
              shareOfViewportWidth: +((spineRect.x / vw) * 100).toFixed(2),
              height: spineRect.height,
            }
          : null,
        inkBandsFirstViewport: new Function(`return (${bandsFn})()`)(),
        docHeightInViewportHeights: +(document.documentElement.scrollHeight / vh).toFixed(2),
        mobileRatioChecks,
      };
    },
    { bandsFn: inkBandsScript.toString() },
  );
}

const browser = await launchChromium();
try {
  await waitForServer(`${BASE}/v1`);

  for (const route of ROUTES) {
    const url = `${BASE}/${route}`;

    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);

      await page.screenshot({ path: path.join(OUT, `first-viewport-${route}-${vp.name}.png`) });

      const geometry = await geometryFor(page);
      fs.writeFileSync(
        path.join(OUT, `geometry-${route}-${vp.name}.json`),
        JSON.stringify(geometry, null, 2),
      );

      // 지연 마운트 요소(척추 재배치 트리거 등)가 다 걸리도록 끝까지 스크롤 후 복귀.
      await page.evaluate(async () => {
        for (let y = 0; y <= document.body.scrollHeight; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 50));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(OUT, `full-${route}-${vp.name}.png`),
        fullPage: true,
      });

      console.log(`캡처: ${route} @ ${vp.name}`);
      await page.close();
    }

    // ---- 1440 전용: 재배치 전/중/후 프레임 + 다크 ----
    {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);

      const secondId = SECTION_IDS[1]; // yorr-restructure — 두 번째 참값으로 재배치가 있는 절.
      const targetTop = await page.evaluate((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : null;
      }, secondId);

      if (targetTop !== null) {
        // 트리거 지점: v1 은 그 절이 뷰포트 50% 만큼 보일 때(whileInView amount:0.5),
        // v2·v3 은 IntersectionObserver rootMargin(-40%/-59%) 이 절 중앙 근처를 본다.
        // 둘 다 대략 "그 절의 상단이 뷰포트 중앙 근처에 올 때"로 근사한다.
        const before = Math.max(0, Math.round(targetTop - 900 * 0.65));
        const mid = Math.max(0, Math.round(targetTop - 900 * 0.45));

        await page.evaluate((y) => window.scrollTo(0, y), before);
        await page.waitForTimeout(150);
        await page.screenshot({ path: path.join(OUT, `spine-before-${route}-1440.png`) });

        await page.evaluate((y) => window.scrollTo(0, y), mid);
        await page.waitForTimeout(300); // ~300ms 안으로 (620ms 재배치 도중).
        await page.screenshot({ path: path.join(OUT, `spine-mid-${route}-1440.png`) });

        await page.waitForTimeout(500); // 620ms + 정지 대역을 넘겨 완전히 정착.
        await page.screenshot({ path: path.join(OUT, `spine-after-${route}-1440.png`) });
      } else {
        console.warn(`경고: ${route} 에서 ${secondId} 를 찾지 못했습니다.`);
      }
      await page.close();
    }

    {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 900 },
        colorScheme: "dark",
      });
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(OUT, `dark-${route}-1440.png`) });
      await page.close();
    }

    // ---- 축소 모션: 첫 페인트 전에 결정되어야 한다 (MOTION_LANGUAGE.md 13.1) ----
    // "커밋 직후 opacity 가 1 인지" 를 확인한다. `waitUntil:"commit"` 은 DOM 이 아직
    // 파싱되지 않은 시점(문서가 없을 수도 있음)이라 `querySelector` 가 항상 null 을
    // 주므로 판정할 수 없다 — `domcontentloaded`(파싱 완료, 하이드레이션 스크립트
    // 실행 전후 경계) 를 쓰고, 결함이 실측된 방식과 같게 CPU 6x 스로틀을 걸어
    // 하이드레이션을 늦춰서 "아직 하이드레이션 전" 구간을 안정적으로 포착한다
    // (MOTION_LANGUAGE.md 13.1 의 실측: "1399ms, 6x 스로틀").
    {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 900 },
        reducedMotion: "reduce",
      });
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
      await page.goto(url, { waitUntil: "domcontentloaded" });
      const opacity = await page.evaluate(() => {
        const el = document.querySelector("[data-enter]");
        return el ? getComputedStyle(el).opacity : null;
      });
      const hasMotionReduceAttr = await page.evaluate(
        () => document.documentElement.dataset.motionReduce === "1",
      );
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(OUT, `reduced-motion-${route}-1440.png`) });
      fs.writeFileSync(
        path.join(OUT, `reduced-motion-${route}.json`),
        JSON.stringify(
          {
            route,
            note: "domcontentloaded, CPU 6x 스로틀 하의 opacity — 하이드레이션 이전 구간을 잡기 위함",
            opacityAtDomContentLoaded: opacity,
            dataMotionReduceAttrSetPrePaint: hasMotionReduceAttr,
            pass: opacity === "1" && hasMotionReduceAttr,
          },
          null,
          2,
        ),
      );
      await page.close();
    }

    console.log(`완료: ${route}`);
  }
} finally {
  await browser.close();
}
console.log(`전부 완료 — 증거는 ${OUT}/ 에 있습니다.`);
