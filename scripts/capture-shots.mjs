#!/usr/bin/env node
/**
 * 프로젝트 데모 스크린샷 캡처.
 *
 * `scripts/capture.mjs` 와 다른 것: 저 스크립트는 **이 사이트**를 찍어 심사에 쓰고,
 * 이 스크립트는 **소개 대상 프로젝트들**을 찍어 사이트에 올릴 소재를 만든다.
 *
 * 왜 별도 스크립트이고 왜 로컬에서 도는가: 에이전트 컨테이너의 이그레스 정책이
 * `*.vercel.app` 을 막는다 (CONNECT 403). 데모에 닿는 곳에서 실행해야 한다.
 *
 * 사용법:
 *   node scripts/capture-shots.mjs                 # 전체
 *   node scripts/capture-shots.mjs pookjayo        # 하나만
 *   node scripts/capture-shots.mjs --dry-run       # 찍을 목록만 출력
 *
 * 출력: public/shots/<프로젝트>/<kind>-<이름>.png
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(import.meta.dirname, "..");
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/shots.config.json"), "utf8"));

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const only = args.filter((a) => !a.startsWith("--"));

const projects = CONFIG.projects.filter((p) => only.length === 0 || only.includes(p.id));
if (projects.length === 0) {
  console.error(`대상 없음. 있는 프로젝트: ${CONFIG.projects.map((p) => p.id).join(", ")}`);
  process.exit(1);
}

const planned = [];
for (const project of projects) {
  if (!project.baseUrl) {
    console.warn(`건너뜀 ${project.id}: baseUrl 이 없다.\n  ${project.localOnly ?? project.source}`);
    continue;
  }
  for (const route of project.routes) {
    planned.push({ project, route });
  }
}

if (planned.length === 0) {
  console.error("찍을 것이 없다. shots.config.json 의 routes 를 채워라.");
  process.exit(1);
}

console.log(`계획 ${planned.length}장:`);
for (const { project, route } of planned) {
  console.log(`  ${project.id}/${route.kind}-${route.name}  ${project.baseUrl}${route.path}`);
}
if (dryRun) process.exit(0);

const browser = await chromium.launch();
const results = [];
const failures = [];

try {
  for (const { project, route } of planned) {
    const vp = CONFIG.viewports[route.kind];
    if (!vp) {
      failures.push(`${project.id}/${route.name}: 뷰포트 종류 "${route.kind}" 가 config 에 없다`);
      continue;
    }

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor ?? 1,
      isMobile: vp.isMobile ?? false,
      hasTouch: vp.hasTouch ?? false,
      // 화면에 한국어가 나오게 한다. 프로젝트들이 ko 를 기본으로 쓴다.
      locale: "ko-KR",
      // 축소 모션으로 찍는다 — 진입 애니메이션 중간이 찍히는 것을 막는다.
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const url = `${project.baseUrl}${route.path}`;

    try {
      const response = await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
      const status = response?.status() ?? 0;
      if (status >= 400) {
        failures.push(`${project.id}/${route.name}: HTTP ${status} — ${url}`);
        await context.close();
        continue;
      }

      // 웹폰트가 앉기 전에 찍으면 글자가 밀린다.
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(700);

      const outDir = path.join(ROOT, "public/shots", project.id);
      fs.mkdirSync(outDir, { recursive: true });
      const file = path.join(outDir, `${route.kind}-${route.name}.png`);
      await page.screenshot({ path: file, fullPage: route.fullPage ?? false });

      // 빈 화면을 찍고 성공했다고 말하지 않는다. 로그인 벽과 오류 페이지가
      // 200 을 주면서 아무것도 안 그리는 경우가 흔하다.
      const ink = await page.evaluate(() => {
        const body = document.body;
        const text = (body.innerText ?? "").trim().length;
        const media = document.querySelectorAll("img, svg, canvas, video").length;
        return { text, media, height: document.documentElement.scrollHeight };
      });
      const thin = ink.text < 40 && ink.media < 2;

      results.push({
        file: path.relative(ROOT, file),
        url,
        kind: route.kind,
        px: `${vp.width}x${vp.height}@${vp.deviceScaleFactor ?? 1}`,
        ...ink,
        suspect: thin,
      });
      console.log(
        `${thin ? "의심" : "캡처"}: ${path.relative(ROOT, file)}  ` +
          `(글자 ${ink.text}자 · 미디어 ${ink.media}개)`,
      );
      if (thin) {
        failures.push(
          `${project.id}/${route.name}: 거의 빈 화면이다 (글자 ${ink.text}자, 미디어 ${ink.media}개). ` +
            `로그인 벽이거나 클라이언트 렌더가 안 끝났을 수 있다 — 파일을 열어서 확인해라.`,
        );
      }
    } catch (error) {
      failures.push(`${project.id}/${route.name}: ${String(error).split("\n")[0]}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

fs.writeFileSync(
  path.join(ROOT, "public/shots/capture-report.json"),
  JSON.stringify({ capturedAt: new Date().toISOString(), results, failures }, null, 2),
);

console.log(`\n성공 ${results.length}장 · 문제 ${failures.length}건`);
for (const f of failures) console.log(`  - ${f}`);
if (failures.length) {
  console.log("\n문제가 있으면 그대로 보고해라. 빈 화면을 스크린샷이라고 넘기지 마라.");
  process.exitCode = 1;
}
