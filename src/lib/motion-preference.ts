"use client";

import { useSyncExternalStore } from "react";

/**
 * 축소 모션(`prefers-reduced-motion: reduce`) 여부.
 *
 * 값의 소재지는 리액트가 아니라 `<html>` 의 `data-motion-reduce` 입니다 — 첫 페인트
 * 전에 도는 인라인 스크립트가 세웁니다 (`preferences.ts` 의 `BOOT_SCRIPT`). 테마와
 * 같은 이유입니다: 하이드레이션을 기다리면 축소 모션을 요청한 사람이 첫 프레임에
 * 애니메이션을 한 번 보게 됩니다.
 *
 * 서버 스냅샷은 `false` 입니다. 서버에는 이 정보가 없고, 축소 모션 사용자에게 실제로
 * 중요한 것은 **첫 페인트의 CSS**(`globals.css` 의 `[data-motion-reduce]` 규칙)이지
 * 이 훅이 아닙니다. 이 훅은 그 뒤에 자바스크립트로 움직이는 것들(Lenis · 스크럽 ·
 * R3F 프레임 루프)을 끄는 데 씁니다.
 */

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(listener: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
