/**
 * 캡처 스크립트 공용 브라우저 · 서버 헬퍼.
 *
 * 왜 이 파일이 있는가 (2026-08-31, STRUCTURAL_BRANCH):
 *
 * 1. `chromium.launch({ channel: "chrome" })` 는 로컬 개발기 전제였다. 정식 Chrome 이
 *    없는 실행 환경(CI · 컨테이너)에서는 첫 줄에서 죽고, 그러면 판정에 쓸 증거가
 *    아예 만들어지지 않는다. Playwright 번들 브라우저 → 설치된 브라우저 순으로 내려간다.
 *
 * 2. 서버 종료가 `taskkill` 하나뿐이었다. 그건 Windows 명령이므로 POSIX 에서는
 *    조용히 실패하고 `npm run start` 자식이 3101 포트를 붙든 채 살아남는다. 다음 캡처는
 *    그 낡은 서버에 붙어서 **소스에 없는 화면을 찍는다** — HANDOFF §3 의 「스테일
 *    스크린샷으로 판정하지 마라」가 기계적으로 재발하는 경로다. 프로세스 그룹째 죽인다.
 */
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { chromium } from "@playwright/test";

/** /opt/pw-browsers 등 설치 디렉터리에서 실제 chrome 실행 파일을 찾는다. */
function findInstalledChromium() {
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    "/opt/pw-browsers",
    path.join(process.env.HOME ?? "", ".cache/ms-playwright"),
  ].filter(Boolean);

  for (const root of roots) {
    let entries;
    try {
      entries = fs.readdirSync(root);
    } catch {
      continue;
    }
    for (const entry of entries.filter((e) => e.startsWith("chromium"))) {
      for (const rel of [
        "chrome-linux/chrome",
        "chrome-linux64/chrome",
        "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
        "chrome-win/chrome.exe",
        "chrome-linux/headless_shell",
      ]) {
        const candidate = path.join(root, entry, rel);
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  }
  return null;
}

/**
 * 실행 가능한 chromium 을 연다. 후보를 순서대로 시도하고 전부 실패하면 던진다.
 * 조용히 넘어가지 않는다 — 증거 없는 통과가 이 저장소의 가장 비싼 실패다.
 */
export async function launchChromium(options = {}) {
  const installed = findInstalledChromium();
  const attempts = [
    { label: "번들 chromium", opts: {} },
    { label: "설치된 chromium", opts: installed ? { executablePath: installed } : null },
    { label: "channel=chrome", opts: { channel: "chrome" } },
  ].filter((a) => a.opts);

  const failures = [];
  for (const { label, opts } of attempts) {
    try {
      const browser = await chromium.launch({ ...opts, ...options });
      console.log(`브라우저: ${label}`);
      return browser;
    } catch (error) {
      failures.push(`${label}: ${String(error).split("\n")[0]}`);
    }
  }
  throw new Error(`chromium 을 열 수 없습니다.\n  - ${failures.join("\n  - ")}`);
}

/**
 * 프로덕션 서버를 띄우고, 종료 함수를 함께 돌려준다.
 * 자식을 프로세스 그룹 리더로 만들어(detached) 그룹째 죽인다.
 */
export function startServer(port) {
  const server = spawn(`npm run start -- --port ${port}`, {
    shell: true,
    stdio: "pipe",
    detached: process.platform !== "win32",
  });

  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    if (process.platform === "win32") {
      spawnSync(`taskkill /pid ${server.pid} /T /F`, { shell: true, stdio: "ignore" });
      return;
    }
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      /* 이미 죽었다 */
    }
  };

  process.on("exit", stop);
  process.on("SIGINT", () => {
    stop();
    process.exit(130);
  });
  return { server, stop };
}

/** 포트가 실제로 응답할 때까지 기다린다. */
export async function waitForServer(url, timeoutMs = 60_000) {
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

/**
 * 포트가 이미 물려 있으면 즉시 실패한다.
 * 낡은 서버에 붙어 존재하지 않는 화면을 찍는 것보다 안 찍는 게 낫다.
 */
export async function assertPortFree(port) {
  try {
    const res = await fetch(`http://localhost:${port}/`);
    throw new Error(
      `포트 ${port} 에 이미 서버가 떠 있습니다 (HTTP ${res.status}). ` +
        `낡은 서버를 찍을 위험이 있으므로 중단합니다. 먼저 그 프로세스를 종료하세요.`,
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("포트 ")) throw error;
    /* 연결 거부 = 포트 비어 있음 = 정상 */
  }
}
