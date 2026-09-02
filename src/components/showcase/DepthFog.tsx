"use client";

import { useStore } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { readColorToken } from "./texture";

/**
 * 깊이에 따른 광량 감쇠 (GOLDEN_FIX 2, "the scene has no light").
 *
 * 실측 결함: 카메라에서 먼 액자와 가까운 액자가 정확히 같은 크림색이었다 —
 * 깊이는 크기와 겹침만으로 표현되고 있었다. `three.js` 의 내장 `Fog` 는 카메라
 * 거리(dz)에 비례해 각 프래그먼트 색을 씬의 `fog.color`(여기서는 방의 색
 * `--ground`)로 섞는다 — 텍스처를 다시 만들지 않고 매 프레임 GPU 가 계산하므로
 * `CorridorGallery` 처럼 카메라가 스크롤을 따라 계속 움직이는 씬에도 그대로
 * 맞는다(텍스처 캐시를 z 마다 다시 굽는 것보다 훨씬 싸다).
 *
 * `MeshBasicMaterial` 은 기본적으로 `fog: true` 다(three.js 기본값) — 이 씬의
 * 유일한 재질(`ShotPlane`)이 그것이므로 별도 설정이 필요 없다.
 *
 * 색은 항상 `--ground` 를 읽는다 — 클리어 컬러(DOM 배경)와 같은 값이라야 먼
 * 액자가 방 속으로 자연스럽게 사라진다(별도 색을 쓰면 안개가 눈에 띄는
 * 색 판으로 보인다).
 */
export function DepthFog({ near, far }: { near: number; far: number }) {
  // `store.getState()` 는 R3F 훅이 직접 돌려주는 값이 아니라 최신 상태의 스냅샷이다
  // — `scene.fog` 대입처럼 three.js 객체를 직접 변형하는 건 R3F 의 표준 패턴이고
  // (`HeroScene.tsx`·`CorridorGallery.tsx` 의 `camera.position.set()` 과 같은 종류),
  // `useThree` 선택자가 돌려준 값을 바로 대입하면 immutability 린트에 걸린다.
  const store = useStore();

  useEffect(() => {
    const { scene, gl, invalidate } = store.getState();
    const color = new THREE.Color(readColorToken("--ground", gl.domElement));
    scene.fog = new THREE.Fog(color, near, far);
    invalidate();
    return () => {
      scene.fog = null;
    };
  }, [store, near, far]);

  return null;
}
