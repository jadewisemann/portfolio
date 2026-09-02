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
import crypto from "node:crypto";
import {
  assertPortFree,
  launchChromium,
  startServer,
  waitForServer,
} from "./lib/browser.mjs";

const args = process.argv.slice(2);
const outDir = args.find((a) => !a.startsWith("--")) ?? "review/golden-slice";
const port = args.includes("--port") ? args[args.indexOf("--port") + 1] : "3101";
const url = `http://localhost:${port}/`;
fs.mkdirSync(outDir, { recursive: true });

/*
  서버를 스스로 띄운다 (2026-09-01).

  이전에는 「서버는 이미 떠 있어야 합니다」를 주석으로만 적어 두고, 안 떠 있으면
  fetch 실패로 크래시했다 — 종료 코드도 0 이라 파이프라인에서는 성공으로 보였다.
  `capture.mjs` 는 자기 서버를 띄웠다 죽이므로 둘을 이어서 돌리면 반드시 이 상태가 된다.
  안내 없는 크래시는 증거 없는 통과로 이어진다.
*/
let stopServer = () => {};
try {
  const res = await fetch(url);
  if (!res.ok) throw new Error("not ok");
  console.log(`서버: 이미 떠 있는 ${url} 에 붙는다`);
} catch {
  console.log(`서버: ${url} 이 응답하지 않아 직접 띄운다`);
  await assertPortFree(Number(port));
  ({ stop: stopServer } = startServer(Number(port)));
  await waitForServer(url);
}

const shot = (p) => path.join(outDir, p);
const md5 = (buf) => crypto.createHash("md5").update(buf).digest("hex");

/*
  전이 중간 프레임을 여러 오프셋에서 찍는 이유 (2026-08-31, STRUCTURAL_BRANCH):

  이전에는 클릭 후 160ms 한 번만 찍고 그것을 「320ms 전이의 중간」이라고 적었다.
  실측해 보면 `review/golden-slice/tree-midtransition-mobile-320.png` 는
  `tree-after-mobile-320.png` 와 **md5 가 같다**(0942fd3d…) — 320px 에서는 그 프레임이
  전이를 하나도 잡지 못했고, 시그니처 인터랙션의 모바일 증거가 사실상 없었다.
  같은 결함이 히어로 Best-of-N 3안 중 2안에서도 나왔다.

  한 오프셋으로 모든 대역(즉각 120ms · 장면 내 200~420ms · 장면 간 420~900ms)을
  맞출 수 없으므로 세 지점을 찍고, 전부 「이후」와 같으면 실패로 보고한다.
*/
const MID_OFFSETS_MS = [60, 140, 260];
const midFrameProblems = [];
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

        const mid = {};
        let elapsed = 0;
        for (const offset of MID_OFFSETS_MS) {
          await page.waitForTimeout(offset - elapsed);
          elapsed = offset;
          mid[offset] = md5(
            await page.screenshot({
              path: shot(`tree-mid${offset}ms-${vp.name}.png`),
            }),
          );
        }
        // 이전 이름을 쓰던 리뷰 문서가 있으므로 대표 프레임 하나는 같은 이름으로 남긴다.
        fs.copyFileSync(
          shot(`tree-mid${MID_OFFSETS_MS[1]}ms-${vp.name}.png`),
          shot(`tree-midtransition-${vp.name}.png`),
        );

        await page.waitForTimeout(600);
        const after = md5(
          await page.screenshot({ path: shot(`tree-after-${vp.name}.png`) }),
        );

        const caught = MID_OFFSETS_MS.filter((o) => mid[o] !== after);
        if (caught.length === 0) {
          midFrameProblems.push(
            `${vp.name}: 중간 프레임 ${MID_OFFSETS_MS.join("/")}ms 가 전부 「이후」와 ` +
              `바이트 동일하다 — 이 뷰포트에는 관측 가능한 전이가 없다.`,
          );
        } else {
          console.log(`전이 포착: ${vp.name} — ${caught.join("/")}ms 에서 「이후」와 다름`);
        }
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
  stopServer();
}

if (midFrameProblems.length) {
  console.error(`\n증거 결함 ${midFrameProblems.length}건:`);
  for (const p of midFrameProblems) console.error(`  - ${p}`);
  console.error("전이를 잡지 못한 증거로 모션을 판정하지 마라.");
  process.exitCode = 1;
}
console.log(`완료 — ${outDir}/`);
