import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": new URL("./src", import.meta.url).pathname },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      // 분모를 전체 src 로 잡는다. 테스트가 import 한 파일만 세면
      // 한 번도 실행되지 않은 소스가 분모에서 빠져 수치가 안전망 크기를 말해주지 못한다.
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.{test,spec}.{ts,tsx}", "src/app/layout.tsx"],
      // thresholds 는 실제 코드가 생긴 뒤 실측값 기준으로 설정한다.
    },
  },
});
