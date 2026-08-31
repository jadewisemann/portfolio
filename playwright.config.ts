import fs from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

/**
 * 브라우저 선택: 정식 Chrome 이 있으면 그것을 쓰고(`channel: "chrome"`, 약 150MB
 * 다운로드 회피), 없으면 이미 설치된 Playwright chromium 을 실행 경로로 직접 지정합니다.
 * 예전에는 `channel: "chrome"` 하나뿐이어서 Chrome 이 없는 환경(CI · 컨테이너)에서는
 * E2E 가 첫 줄부터 죽었습니다. 판정에 쓸 증거가 아예 안 만들어지는 게 가장 비싼 실패입니다.
 *
 * 왜 E2E 가 필요한가:
 *   1) 이 사이트의 축인 거터 기호 교체는 IntersectionObserver 로 동작하는데,
 *      개발용 브라우저 페인에서 IO 콜백이 전달되지 않아 검증할 수 없었습니다.
 *   2) 아트 디렉션이 320px 가로 넘침을 스크린샷 비교가 아니라 **기하 계산**으로
 *      판정하라고 요구합니다. 이 사이트가 소개하는 프로젝트에서 쓴 방법이고, 같은 방법을
 *      쓰지 않으면 포지셔닝에 대한 반증이 됩니다.
 */
/**
 * 정식 Chrome 이 없으면 설치된 chromium 실행 파일을 찾는다.
 * 실행 경로는 `use.executablePath` 가 아니라 **`use.launchOptions.executablePath`** 다.
 * 전자는 Playwright 가 조용히 무시하고 번들 headless shell 을 찾다가 죽는다.
 */
function resolveBrowser(): Record<string, unknown> {
  if (fs.existsSync("/opt/google/chrome/chrome")) return { channel: "chrome" };

  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    "/opt/pw-browsers",
    path.join(process.env.HOME ?? "", ".cache/ms-playwright"),
  ].filter((r): r is string => Boolean(r));

  for (const root of roots) {
    let entries: string[];
    try {
      entries = fs.readdirSync(root);
    } catch {
      continue;
    }
    for (const entry of entries.filter((e) => e.startsWith("chromium-"))) {
      for (const rel of [
        "chrome-linux/chrome",
        "chrome-linux64/chrome",
        "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
        "chrome-win/chrome.exe",
      ]) {
        const candidate = path.join(root, entry, rel);
        if (fs.existsSync(candidate)) return { launchOptions: { executablePath: candidate } };
      }
    }
  }
  // 아무것도 못 찾으면 Playwright 기본 해석에 맡긴다 (에러 메시지가 더 친절하다).
  return {};
}

const browser = resolveBrowser();

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: process.env.CI ? "line" : "list",
  use: { baseURL: "http://localhost:3100" },
  webServer: {
    // 개발 서버가 아니라 프로덕션 빌드를 검증합니다.
    command: "npm run build && npm run start -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [
    {
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"], ...browser, viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile-320",
      use: { ...devices["Desktop Chrome"], ...browser, viewport: { width: 320, height: 640 } },
    },
  ],
});
