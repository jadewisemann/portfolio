"use client";

import { useSyncExternalStore } from "react";

/**
 * 768px 이상인지. 히어로와 복도가 함께 쓴다 — 씬을 켤지 결정하는 조건 중 하나다
 * (`HeroDiorama.tsx` · `CorridorCanvas.tsx`). `useSyncExternalStore` 를 쓰는
 * 이유: 이펙트 본문에서 `setState` 를 동기 호출하면 리액트 훅 린트가 캐스케이드
 * 렌더 경고를 낸다 — 외부 스토어(matchMedia)를 구독하는 정석 방법으로 대신한다.
 */
const QUERY = "(min-width: 768px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsWide(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
