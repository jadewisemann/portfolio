import localFont from "next/font/local";

/*
  서체 조합 세 벌. 화면 오른쪽 위의 설정에서 고를 수 있고, 고른 값은 `<html>` 의
  `data-font` 로 내려가 `globals.css` 가 스택을 갈아낍니다.

  | 조합 | 라틴 | 한글 | 등폭 |
  |---|---|---|---|
  | `grotesk` (기본) | Space Grotesk | Gothic A1 | JetBrains Mono |
  | `serif` | Fraunces | Noto Serif KR | JetBrains Mono |
  | `plex` | IBM Plex Sans KR (겸용) | IBM Plex Sans KR | IBM Plex Mono |

  전부 Google Fonts (OFL-1.1) 이지만 `next/font/google` 로 싣지 않습니다 — 그 경로의
  서체 목록에 **korean 서브셋을 지원하는 것이 0종**이기 때문입니다 (Next 16.3.3 의
  `font-data.json`, 2026-09-03 재확인). 원본 ttf 를 받아 이 사이트가 실제로 출력하는
  글자만 남긴 woff2 를 `npm run fonts` 로 굽고, 그것을 `next/font/local` 로 싣습니다.
  한글 한 웨이트가 원본 2.2 ~ 23MB 에서 53 ~ 109KB 가 됩니다.

  **라틴 서체에는 한글이 없습니다.** 스택이 `라틴, 한글, 대체` 순이므로 한글 글리프는
  둘째 자리에서 그려집니다. 이것이 의도된 조판입니다 — 라틴은 성격을, 한글은 가독성을
  맡습니다.

  `preload` 는 기본 조합에만 켭니다. 나머지 여섯 파일은 그 조합을 고른 사용자만
  내려받습니다 — 켜 두면 아무도 안 쓰는 서체를 첫 화면에서 여섯 개 받습니다.
*/

/* ─────────────────────────────────────────────────── grotesk (기본) */

export const spaceGrotesk = localFont({
  src: [
    { path: "./space-grotesk-400.woff2", weight: "400", style: "normal" },
    { path: "./space-grotesk-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-space-grotesk",
  display: "swap",
  adjustFontFallback: false,
});

export const gothicA1 = localFont({
  src: [
    { path: "./gothic-a1-400.woff2", weight: "400", style: "normal" },
    { path: "./gothic-a1-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-gothic-a1",
  display: "swap",
  fallback: ["Apple SD Gothic Neo", "Malgun Gothic", "system-ui", "sans-serif"],
  adjustFontFallback: false,
});

export const jetbrainsMono = localFont({
  src: [{ path: "./jetbrains-mono-400.woff2", weight: "400", style: "normal" }],
  variable: "--font-jetbrains-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
  adjustFontFallback: false,
});

/* ────────────────────────────────────────────────────────────── serif */

export const fraunces = localFont({
  src: [
    { path: "./fraunces-400.woff2", weight: "400", style: "normal" },
    { path: "./fraunces-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-fraunces",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const notoSerifKR = localFont({
  src: [
    { path: "./noto-serif-kr-400.woff2", weight: "400", style: "normal" },
    { path: "./noto-serif-kr-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-noto-serif-kr",
  display: "swap",
  preload: false,
  fallback: ["Apple SD Gothic Neo", "Malgun Gothic", "serif"],
  adjustFontFallback: false,
});

/* ─────────────────────────────────────────────────────────────── plex */

export const plexSansKR = localFont({
  src: [
    { path: "./plex-sans-kr-400.woff2", weight: "400", style: "normal" },
    { path: "./plex-sans-kr-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-plex-sans",
  display: "swap",
  preload: false,
  fallback: ["Apple SD Gothic Neo", "Malgun Gothic", "system-ui", "sans-serif"],
  adjustFontFallback: false,
});

export const plexMono = localFont({
  src: [{ path: "./plex-mono-400.woff2", weight: "400", style: "normal" }],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
  // 한글 폴백은 여기서 줄 수 없습니다 — next/font 가 family 이름을 해시하므로
  // "IBM Plex Sans KR" 같은 문자열이 해결되지 않습니다.
  // globals.css 의 등폭 스택에서 한글 서체를 이어 붙입니다.
  fallback: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
  adjustFontFallback: false,
});

/** `<html>` 에 한 번에 붙일 CSS 변수 클래스들. 순서는 의미가 없습니다. */
export const fontVariables = [
  spaceGrotesk.variable,
  gothicA1.variable,
  jetbrainsMono.variable,
  fraunces.variable,
  notoSerifKR.variable,
  plexSansKR.variable,
  plexMono.variable,
].join(" ");
