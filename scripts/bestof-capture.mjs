import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.cwd(), "review/hero-bestof");
mkdirSync(OUT, { recursive: true });

const BASE = "http://localhost:3199";
const VARIANTS = ["v1", "v2", "v3"];
const VIEWPORTS = [
  { name: "1920", width: 1920, height: 1080 },
  { name: "1440", width: 1440, height: 900 },
  { name: "320", width: 320, height: 640 },
];

async function measureGeometry(page) {
  return page.evaluate(() => {
    function isVisible(el) {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }
    const h1 = document.querySelector("h1");
    const h1Rect = h1 ? h1.getBoundingClientRect() : null;
    const h1Style = h1 ? getComputedStyle(h1) : null;

    let maxSize = 0;
    let maxSizeEl = null;
    document.querySelectorAll("body *").forEach((el) => {
      if (el.children.length > 0) return; // leaf-ish only
      const text = (el.textContent || "").trim();
      if (!text) return;
      if (!isVisible(el)) return;
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size > maxSize) {
        maxSize = size;
        maxSizeEl = el.className || el.tagName;
      }
    });

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const docH = document.documentElement.scrollHeight;

    // Widest visible text-bearing line as a proxy for "ink span".
    let widestLine = 0;
    document.querySelectorAll("body *").forEach((el) => {
      if (el.children.length > 0) return;
      const text = (el.textContent || "").trim();
      if (!text) return;
      if (!isVisible(el)) return;
      const r = el.getBoundingClientRect();
      if (r.width > widestLine) widestLine = r.width;
    });

    return {
      h1: h1Rect
        ? {
            fontSize: h1Style.fontSize,
            rect: { x: h1Rect.x, y: h1Rect.y, width: h1Rect.width, height: h1Rect.height },
          }
        : null,
      largestTypeOnPage: { size: maxSize, el: maxSizeEl },
      widestInkLinePx: widestLine,
      inkSpanShareOfViewport: vw ? widestLine / vw : null,
      viewport: { width: vw, height: vh },
      documentHeightPx: docH,
      documentHeightInViewportHeights: vh ? docH / vh : null,
      hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };
  });
}

async function findS1(page) {
  return page.evaluate(() => {
    const el = document.getElementById("yorr-alone");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, height: r.height };
  });
}

const ROOT_SELECTOR = { v1: ".bo1-root", v2: ".bo2-root", v3: null };

/**
 * v1/v2 는 IntersectionObserver 가 만든 불리언(`data-scene`)이 뷰포트 밖에서도
 * 존재하므로, 그 값이 "s1" 로 뒤집히는 지점까지 스크롤을 조금씩 내리며 찾는다.
 * S1 절이 한 뷰포트보다 훨씬 크므로(threshold=0.5 는 절 자신의 면적 기준),
 * 목표 지점을 미리 계산하지 않고 실제로 찾는다.
 */
async function scrollToSceneCross(page, rootSelector, s1Top, viewportHeight) {
  let y = Math.max(0, s1Top - viewportHeight * 1.3);
  const maxY = s1Top + viewportHeight * 1.5;
  const step = Math.max(16, Math.round(viewportHeight / 40));
  while (y <= maxY) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    const scene = await page.evaluate((sel) => document.querySelector(sel)?.dataset.scene, rootSelector);
    if (scene === "s1") return true;
    y += step;
  }
  return false;
}

async function run() {
  const browser = await chromium.launch({ channel: "chrome" });

  for (const variant of VARIANTS) {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();
      await page.goto(`${BASE}/${variant}`, { waitUntil: "networkidle" });

      // First viewport (not full page).
      await page.screenshot({ path: path.join(OUT, `${variant}-first-viewport-${vp.name}.png`) });

      // Geometry at rest (hero state).
      const geomHero = await measureGeometry(page);

      // Scroll to S1, capture geometry there too.
      const s1 = await findS1(page);
      let geomS1 = null;
      if (s1) {
        await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, s1.top - 40));
        await page.waitForTimeout(850); // let any transition fully settle
        geomS1 = await measureGeometry(page);
        // Settled S1 state (after the transition has fully arrived) — a
        // fullPage shot cannot show this and the hero state at once, since
        // the whole document shares one scene boolean.
        await page.screenshot({ path: path.join(OUT, `${variant}-s1-settled-${vp.name}.png`) });
      }

      // Scrolling back to the top re-triggers the hero<->S1 shared-element /
      // spine transition in reverse. Wait past the 720ms inter-scene band so
      // the full-page capture shows a settled state, not a mid-flight frame.
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(900);
      await page.screenshot({ path: path.join(OUT, `${variant}-full-page-${vp.name}.png`), fullPage: true });

      writeFileSync(
        path.join(OUT, `geometry-${variant}-${vp.name}.json`),
        JSON.stringify({ variant, viewport: vp, atHero: geomHero, atS1: geomS1 }, null, 2),
      );

      await context.close();
    }

    // Mid-transition capture at every viewport.
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();
      await page.goto(`${BASE}/${variant}`, { waitUntil: "networkidle" });

      const s1 = await findS1(page);
      const rootSelector = ROOT_SELECTOR[variant];
      if (s1 && rootSelector) {
        const crossed = await scrollToSceneCross(page, rootSelector, s1.top, vp.height);
        if (crossed) {
          // The inter-scene ease (--ease-spine, cubic-bezier(0.16,1,0.3,1)) is
          // heavily front-loaded, so a short wait already shows real motion.
          await page.waitForTimeout(110);
        }
        await page.screenshot({ path: path.join(OUT, `${variant}-mid-transition-${vp.name}.png`) });
      } else if (s1) {
        // v3: nothing animates by design. Capture the hero/S1 boundary scroll
        // position for honesty, not because anything is mid-motion.
        const targetY = Math.max(0, s1.top - vp.height * 0.4);
        await page.evaluate((y) => window.scrollTo(0, y), targetY);
        await page.screenshot({ path: path.join(OUT, `${variant}-mid-transition-${vp.name}.png`) });
      }
      await context.close();
    }

    // Reduced-motion full-page capture (1440 only) to confirm the static alternative.
    {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      await page.goto(`${BASE}/${variant}`, { waitUntil: "networkidle" });
      await page.screenshot({ path: path.join(OUT, `${variant}-reduced-motion-1440.png`), fullPage: true });
      await context.close();
    }
  }

  await browser.close();
  console.log("done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
