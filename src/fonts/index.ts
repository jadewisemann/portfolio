import localFont from "next/font/local";

// next/font/google 은 korean 서브셋을 지원하는 서체가 0종이므로 local 경로를 쓴다.
// woff2 는 npm run fonts 로 생성한다 (scripts/subset-fonts.mjs).
// fallback 메트릭은 스왑 시 리플로를 줄이기 위한 것이고, 실측 후 조정한다.
export const sansKR = localFont({
  src: [
    { path: "./plex-sans-kr-400.woff2", weight: "400", style: "normal" },
    { path: "./plex-sans-kr-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-plex-sans",
  display: "swap",
  fallback: ["Apple SD Gothic Neo", "Malgun Gothic", "system-ui", "sans-serif"],
  adjustFontFallback: false,
});

export const mono = localFont({
  src: [{ path: "./plex-mono-400.woff2", weight: "400", style: "normal" }],
  variable: "--font-plex-mono",
  display: "swap",
  // 한글 폴백은 여기서 줄 수 없습니다 — next/font 가 family 이름을 해시하므로
  // "IBM Plex Sans KR" 같은 문자열이 해결되지 않습니다.
  // globals.css 의 `--font-mono` 스택에서 `--font-plex-sans` 를 이어 붙입니다.
  fallback: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
  adjustFontFallback: false,
});
