"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_FONT,
  DEFAULT_THEME,
  FONT_KEY,
  THEME_KEY,
  type FontChoice,
  type ThemeChoice,
  isFont,
  isTheme,
  resolveTheme,
} from "./preferences";

/**
 * 선택값의 저장소는 리액트가 아니라 **`<html>` 의 데이터 속성**입니다.
 *
 * 왜 이렇게 두는가: 그 속성은 첫 페인트 전에 인라인 스크립트가 세웁니다
 * (`preferences.ts` 의 `BOOT_SCRIPT`). 리액트가 값의 주인이 되면 하이드레이션 전까지
 * 기본값을 그리고 그 뒤에 뒤집히므로, 저장된 값이 라이트인 사람이 흰 화면으로 번쩍이는
 * 것을 봅니다. 그래서 DOM 이 주인이고, 리액트는 `useSyncExternalStore` 로 **구독만**
 * 합니다.
 *
 * DOM 을 고치는 일도 전부 이 모듈의 함수가 합니다. 컴포넌트 안에서 바깥 값을 직접
 * 고치면 리액트 컴파일러의 불변성 규칙에 걸리고, 그 규칙이 가리키는 문제(렌더 중에
 * 외부 상태가 바뀌는 것)도 실재합니다.
 */

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readTheme(): ThemeChoice {
  const value = document.documentElement.dataset.themeChoice;
  return isTheme(value) ? value : DEFAULT_THEME;
}

function readFont(): FontChoice {
  const value = document.documentElement.dataset.font;
  return isFont(value) ? value : DEFAULT_FONT;
}

/** 서버 렌더에는 선택이 없습니다. 기본값으로 그리고, 하이드레이션 뒤 실제 값으로 맞춥니다. */
const serverTheme = () => DEFAULT_THEME;
const serverFont = () => DEFAULT_FONT;

export function useThemeChoice(): ThemeChoice {
  return useSyncExternalStore(subscribe, readTheme, serverTheme);
}

export function useFontChoice(): FontChoice {
  return useSyncExternalStore(subscribe, readFont, serverFont);
}

export function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  root.dataset.themeChoice = choice;
  root.dataset.theme = resolveTheme(choice);
  try {
    localStorage.setItem(THEME_KEY, choice);
  } catch {
    // 저장이 막힌 브라우저(프라이빗 모드 · 쿠키 차단)에서도 이번 방문 동안은 유지됩니다.
  }
  emit();
}

export function applyFont(choice: FontChoice) {
  document.documentElement.dataset.font = choice;
  try {
    localStorage.setItem(FONT_KEY, choice);
  } catch {
    // 위와 같습니다.
  }
  emit();
}

/**
 * OS 의 밝기 설정이 바뀌었을 때 다시 푼다. 「시스템」을 고른 동안에만 의미가 있고,
 * 사용자가 라이트 · 다크를 명시적으로 골랐으면 아무 일도 하지 않는다 — 명시적 선택이
 * OS 보다 우선한다.
 */
export function syncSystemTheme() {
  const root = document.documentElement;
  if (root.dataset.themeChoice !== "system") return;
  root.dataset.theme = resolveTheme("system");
}
