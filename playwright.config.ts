import { defineConfig, devices } from "@playwright/test";

/**
 * 설치된 Chrome 을 씁니다 (`channel: "chrome"`). Playwright 번들 브라우저를
 * 내려받지 않습니다 — 약 150MB 다운로드를 피하려는 것입니다.
 *
 * 왜 E2E 가 필요한가:
 *   1) 이 사이트의 축인 거터 기호 교체는 IntersectionObserver 로 동작하는데,
 *      개발용 브라우저 페인에서 IO 콜백이 전달되지 않아 검증할 수 없었습니다.
 *   2) 아트 디렉션이 320px 가로 넘침을 스크린샷 비교가 아니라 **기하 계산**으로
 *      판정하라고 요구합니다. 이 사이트가 소개하는 프로젝트에서 쓴 방법이고, 같은 방법을
 *      쓰지 않으면 포지셔닝에 대한 반증이 됩니다.
 */
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
      use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile-320",
      use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 320, height: 640 } },
    },
  ],
});
