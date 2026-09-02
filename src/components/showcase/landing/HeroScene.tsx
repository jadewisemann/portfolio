"use client";

import { Canvas, useStore } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import { ShotPlane } from "../ShotPlane";
import { heroItemsDesktop } from "./layout";
import styles from "./HeroScene.module.css";

/**
 * 히어로의 라이브 씬. 카메라는 스크롤과 무관하게 원점에 고정된다 — 히어로는
 * 스크롤하지 않고도 이미 완성된 구성이어야 한다(브리프: "landed inside the
 * composition"). 유일한 움직임은 정밀 포인터의 시차뿐이고, 그것도 이벤트가 올
 * 때만 `invalidate()` 를 부른다(`frameloop="demand"`) — 유휴 상태에서 rAF 0건.
 *
 * 320px 미만에서는 이 컴포넌트 자체를 마운트하지 않는다(`HeroDiorama.tsx`).
 * 세로 화면비에서 데스크톱 구도를 그대로 렌더하면 "줄인 것"이 되기 때문이다.
 */
const PARALLAX_RANGE = 0.22;

function Rig() {
  const store = useStore();
  const base = useRef({ x: 0, y: 0 });

  const apply = useCallback(
    (x: number, y: number) => {
      const { camera, invalidate } = store.getState();
      camera.position.set(x, y, 0);
      invalidate();
    },
    [store],
  );

  useEffect(() => {
    apply(0, 0);
  }, [apply]);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = store.getState().gl.domElement;
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      base.current = { x: nx * PARALLAX_RANGE, y: ny * -PARALLAX_RANGE };
      apply(base.current.x, base.current.y);
    };
    const onLeave = () => {
      base.current = { x: 0, y: 0 };
      apply(0, 0);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [apply, store]);

  return null;
}

export function HeroScene() {
  const items = heroItemsDesktop();

  return (
    <Canvas
      camera={{ position: [0, 0, 0], fov: 50 }}
      className={styles.canvas}
      dpr={[1, 2]}
      frameloop="demand"
    >
      <Rig />
      {items.map((item) => (
        <ShotPlane
          height={item.height}
          key={item.key}
          position={[item.x, item.y, item.z]}
          rotation={[0, item.rotY, item.rotZ]}
          shot={item.shot}
          width={item.width}
        />
      ))}
    </Canvas>
  );
}
