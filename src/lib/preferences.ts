/**
 * 보는 사람이 고르는 두 가지 — 테마와 서체 조합.
 *
 * 이 파일이 **정본 하나**입니다. 첫 페인트 전에 도는 인라인 스크립트(`layout.tsx`)와
 * 설정 패널(`SettingsMenu.tsx`)이 같은 키 · 같은 기본값 · 같은 허용 목록을 써야 하는데,
 * 둘이 갈라지면 「스크립트가 세운 값과 패널이 표시하는 값이 다른」 상태가 되고 그것은
 * 눈으로만 보입니다. 그래서 스크립트 본문도 여기서 만듭니다.
 */

export const THEME_CHOICES = ["system", "light", "dark"] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];

export const FONT_CHOICES = ["grotesk", "serif", "plex"] as const;
export type FontChoice = (typeof FONT_CHOICES)[number];

export const THEME_KEY = "portfolio:theme";
export const FONT_KEY = "portfolio:font";

/*
  기본값이 「시스템」이 아니라 「다크」인 이유: 다크가 이 사이트의 **정본**이기
  때문입니다 (`DESIGN_SYSTEM.md` §3). 팔레트도 히어로의 빛 웅덩이도 어두운 지면을
  전제로 설계됐고, 처음 보는 화면이 그 설계여야 합니다. 「시스템」은 목록에 그대로
  있으므로 OS 설정을 따르게 하려는 사람은 한 번 고르면 됩니다.
*/
export const DEFAULT_THEME: ThemeChoice = "dark";
export const DEFAULT_FONT: FontChoice = "grotesk";

export const THEME_LABELS: Record<ThemeChoice, string> = {
  system: "시스템",
  light: "라이트",
  dark: "다크",
};

/** 서체 이름은 고유명사이므로 옮기지 않습니다. 조합의 구성만 함께 적습니다. */
export const FONT_LABELS: Record<FontChoice, { name: string; note: string }> = {
  grotesk: { name: "Grotesk", note: "Space Grotesk · Gothic A1" },
  serif: { name: "Serif", note: "Fraunces · Noto Serif KR" },
  plex: { name: "Plex", note: "IBM Plex Sans KR" },
};

export function isTheme(value: unknown): value is ThemeChoice {
  return THEME_CHOICES.includes(value as ThemeChoice);
}

export function isFont(value: unknown): value is FontChoice {
  return FONT_CHOICES.includes(value as FontChoice);
}

/**
 * 「시스템」을 실제 두 값 중 하나로 푼다. 이 함수의 결과가 `data-theme` 이고,
 * `data-theme-choice` 는 사용자가 고른 값(`system` 포함) 그대로다.
 */
export function resolveTheme(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "system") return choice;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/**
 * `<head>` 에서 동기적으로 도는 스크립트. **첫 페인트 전에** 세 가지를 세운다:
 *
 *   1. `data-js` — 히어로의 초기 은닉 게이트 (MOTION_LANGUAGE.md 9.1 다)
 *   2. `data-motion-reduce` — 축소 모션 (13.1)
 *   3. `data-theme` · `data-theme-choice` · `data-font` — 이 파일의 두 선택
 *
 * 셋 다 하이드레이션을 기다리면 안 되는 값이다. 테마를 리액트 상태로 두면 저장된 값이
 * 라이트인 사용자가 첫 프레임에 다크를 보고 하이드레이션 뒤에 흰 화면으로 뒤집힌다 —
 * 축소 모션에서 이미 한 번 겪은 결함(13.1)과 같은 종류다.
 *
 * `localStorage` 접근은 던질 수 있다(프라이빗 모드 · 쿠키 차단). 던지면 기본값으로
 * 간다 — 화면이 안 나오는 것보다 낫다.
 */
export const BOOT_SCRIPT = [
  'var d=document.documentElement;d.dataset.js="1";',
  "var m=window.matchMedia;",
  'if(m&&m("(prefers-reduced-motion: reduce)").matches){d.dataset.motionReduce="1"}',
  `var t="${DEFAULT_THEME}",f="${DEFAULT_FONT}";`,
  `try{t=localStorage.getItem(${JSON.stringify(THEME_KEY)})||t;f=localStorage.getItem(${JSON.stringify(FONT_KEY)})||f}catch(e){}`,
  `if(${JSON.stringify(THEME_CHOICES)}.indexOf(t)<0){t="${DEFAULT_THEME}"}`,
  `if(${JSON.stringify(FONT_CHOICES)}.indexOf(f)<0){f="${DEFAULT_FONT}"}`,
  "d.dataset.themeChoice=t;",
  'd.dataset.theme=t==="system"?(m&&m("(prefers-color-scheme: light)").matches?"light":"dark"):t;',
  "d.dataset.font=f;",
].join("");
