import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 320, height: 640 } });
await page.goto("http://localhost:3199/v1", { waitUntil: "networkidle" });
const info = await page.evaluate(() => {
  const el = document.querySelector(".bo1-hero-rule");
  if (!el) return { found: false };
  const r = el.getBoundingClientRect();
  const s = getComputedStyle(el);
  return {
    found: true,
    rect: { x: r.x, y: r.y, width: r.width, height: r.height },
    display: s.display,
    background: s.backgroundColor,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
