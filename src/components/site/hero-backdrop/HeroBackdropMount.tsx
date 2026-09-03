"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/*
  캔버스를 언제 붙일지 정하는 껍데기.

  세 가지를 여기서 판정합니다:

  1. **WebGL2 가 있는가.** 없으면 아무것도 붙이지 않습니다. 히어로의 배경 그러데이션은
     CSS 가 이미 그리고 있으므로 화면이 비지 않습니다.
  2. **첫 화면 안에 있는가.** 밖으로 나가면 `frameloop` 을 멈춥니다 — 페이지 아래쪽을
     읽는 동안 GPU 가 계속 돌 이유가 없습니다.
  3. **서버에서 렌더하지 않는다.** `ssr: false` — three.js 는 서버에서 실행할 수 없고,
     첫 HTML 에 들어갈 것도 없습니다.
*/
const HeroBackdrop = dynamic(() => import("./HeroBackdrop"), { ssr: false });

/*
  탐지 결과를 모듈에 한 번만 캐시합니다. `useSyncExternalStore` 의 스냅샷은 호출할
  때마다 같은 값을 돌려줘야 하고, 캔버스를 매번 만드는 것도 낭비입니다.
*/
let cachedSupport: boolean | null = null;

function readSupport(): boolean {
  if (cachedSupport === null) {
    try {
      cachedSupport = Boolean(document.createElement("canvas").getContext("webgl2"));
    } catch {
      cachedSupport = false;
    }
  }
  return cachedSupport;
}

/** 값이 바뀌지 않으므로 구독할 것이 없습니다. */
const noSubscription = () => () => {};
const serverSupport = () => false;

export function HeroBackdropMount() {
  const anchor = useRef<HTMLDivElement>(null);
  const supported = useSyncExternalStore(noSubscription, readSupport, serverSupport);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const element = anchor.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hero-backdrop-anchor" ref={anchor}>
      {supported ? <HeroBackdrop active={active} /> : null}
    </div>
  );
}
