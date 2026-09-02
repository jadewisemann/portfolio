"use client";

import { Canvas, useFrame, useStore } from "@react-three/fiber";
import { useEffect, useRef } from "react";
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
/*
  실측 결함: 포인터 시차가 이벤트를 그대로 카메라 좌표에 1:1로 매핑했고,
  `pointerleave` 에서는 중앙으로 한 프레임 만에 스냅했다 — 감쇠가 없었다.
  목표(target)와 실제 카메라 위치(current)를 분리하고 `useFrame` 에서 지수
  감쇠로 좁힌다. `TAU` 는 목표까지 거리의 63% 를 좁히는 데 걸리는 시간(초)이다.
  `frameloop="demand"` 를 유지한다 — 목표에 도달하면 `invalidate()` 를 더 부르지
  않으므로 유휴 상태에서 rAF 가 다시 0건이 된다.
*/
const PARALLAX_TAU = 0.15;
const PARALLAX_EPSILON = 0.0005;

function Rig() {
  const store = useStore();
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const { camera, invalidate } = store.getState();
    camera.position.set(0, 0, 0);
    invalidate();
  }, [store]);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = store.getState().gl.domElement;
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      target.current = { x: nx * PARALLAX_RANGE, y: ny * -PARALLAX_RANGE };
      store.getState().invalidate();
    };
    const onLeave = () => {
      target.current = { x: 0, y: 0 };
      store.getState().invalidate();
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [store]);

  useFrame((state, delta) => {
    const dx = target.current.x - current.current.x;
    const dy = target.current.y - current.current.y;
    if (Math.abs(dx) < PARALLAX_EPSILON && Math.abs(dy) < PARALLAX_EPSILON) {
      // 이미 목표에 도달했다 — invalidate 를 다시 부르지 않으므로 여기서 멈춘다.
      return;
    }
    const damp = 1 - Math.exp(-delta / PARALLAX_TAU);
    current.current = {
      x: current.current.x + dx * damp,
      y: current.current.y + dy * damp,
    };
    state.camera.position.set(current.current.x, current.current.y, 0);
    state.invalidate();
  });

  return null;
}

export function HeroScene() {
  const items = heroItemsDesktop();

  return (
    <>
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
      {/*
        WebGL 캔버스는 스크린리더에 아무것도 노출하지 않는다 — `ShotPlane` 은
        텍스처만 그리고 `shot.alt` 를 읽지 않는다(`PlaceholderFrame` 만
        읽는다). 실사진이 들어오는 순간 이 씬은 사진 콘텐츠 없이 렌더되므로
        지금 텍스트 경로를 만들어 둔다(WCAG 1.1.1).
      */}
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item.key}>{item.shot.alt}</li>
        ))}
      </ul>
    </>
  );
}
