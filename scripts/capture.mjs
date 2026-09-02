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
import { spawnSync } from "node:child_process";
import {
  assertPortFree,
  launchChromium,
  startServer,
  waitForServer,
} from "./lib/browser.mjs";

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

await assertPortFree(PORT);
const { stop: kill } = startServer(PORT);

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

const browser = await launchChromium();
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
        /*
          잉크 계측 (개정 2026-09-01).

          이전 구현은 `main/nav/header` 의 **leaf 텍스트 요소 바운딩박스**만 더했다.
          그래서 내용이 `<canvas>` 인 페이지는 아무것도 못 본다 — 다크 랜딩을 재면
          빈 띠 33.3% 가 나오는데, 실제로 화면은 액자로 가득 차 있었고 그 값이
          비평가를 오도했다.

          이제 스크린샷의 픽셀을 센다. 지면색은 추정하지 않고 페이지가 선언한
          `--ground` 를 읽는다 — 최빈색 추정판은 액자가 화면의 절반을 넘는 순간
          지면과 잉크를 뒤집는다.
        */
        const groundHex = await page.evaluate(() => {
          const raw = getComputedStyle(document.documentElement)
            .getPropertyValue("--ground")
            .trim();
          if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
          const probe = document.createElement("canvas").getContext("2d");
          probe.fillStyle = raw || getComputedStyle(document.body).backgroundColor;
          return probe.fillStyle;
        });

        const measurePage = await browser.newPage();
        let ink;
        try {
          await measurePage.setContent(
            `<img id="s" src="data:image/png;base64,${(await fs.promises.readFile(firstFile)).toString("base64")}">`,
          );
          await measurePage.locator("#s").waitFor({ state: "attached" });
          ink = await measurePage.evaluate(async (declaredGround) => {
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

            const m = /^#?([0-9a-f]{6})$/i.exec((declaredGround ?? "").trim());
            const gr = m ? parseInt(m[1].slice(0, 2), 16) : 250;
            const gg = m ? parseInt(m[1].slice(2, 4), 16) : 249;
            const gb = m ? parseInt(m[1].slice(4, 6), 16) : 246;

            // 옅은 것(기판·헤어라인)과 진한 것(눈에 잡히는 표시)을 나눈다.
            const FAINT = 6;
            const STRONG = 64;
            const BAND = 160;
            const bandFaint = new Array(Math.ceil(w / BAND)).fill(0);
            const bandStrong = new Array(Math.ceil(w / BAND)).fill(0);
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
                const b = Math.floor(x / BAND);
                faint += 1;
                bandFaint[b] += 1;
                if (diff > STRONG) {
                  strong += 1;
                  bandStrong[b] += 1;
                }
              }
            }
            const area = (i) => (Math.min((i + 1) * BAND, w) - i * BAND) * h;
            const strongPct = bandStrong.map((n, i) => (n / area(i)) * 100);
            const faintPct = bandFaint.map((n, i) => (n / area(i)) * 100);
            return {
              viewport: { w, h },
              ground: `rgb(${gr},${gg},${gb})`,
              strongInkSharePct: +((strong / (w * h)) * 100).toFixed(2),
              paintedSharePct: +((faint / (w * h)) * 100).toFixed(2),
              emptyBandSharePct: +(
                (strongPct.filter((v) => v < 0.05).length / strongPct.length) * 100
              ).toFixed(1),
              blankBandSharePct: +(
                (faintPct.filter((v) => v === 0).length / faintPct.length) * 100
              ).toFixed(1),
              bands: strongPct.map((v, i) => ({
                x0: i * BAND,
                strongPct: +v.toFixed(3),
                faintPct: +faintPct[i].toFixed(3),
              })),
            };
          }, groundHex);
        } finally {
          await measurePage.close();
        }
        ink.screens = await page.evaluate(
          () => +(document.documentElement.scrollHeight / innerHeight).toFixed(2),
        );

        fs.writeFileSync(
          path.join(outDir, `ink-${vp.name}${parts}.json`),
          JSON.stringify(ink, null, 2),
        );
        console.log(
          `  잉크: ${vp.name}${parts} 진한 ${ink.strongInkSharePct}% · ` +
            `빈 띠 ${ink.emptyBandSharePct}% · ${ink.screens} 화면`,
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
