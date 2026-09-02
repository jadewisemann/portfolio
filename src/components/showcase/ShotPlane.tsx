"use client";

import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import type { Shot } from "./shots";
import { getPlaceholderTexture, readColorToken } from "./texture";

/**
 * 평면 하나. `shot.src` 가 비어 있으면 자리표시자 텍스처, 있으면 실제 이미지를
 * 로드한다. 두 갈래를 컴포넌트 두 개로 나눈 이유는 훅 규칙 — `useTexture` 는
 * 조건 없이 호출해야 하므로, 조건은 "어느 컴포넌트를 렌더할지"에서 가른다.
 */
export function ShotPlane({
  shot,
  width,
  height,
  position,
  rotation,
}: {
  shot: Shot;
  width: number;
  height: number;
  position: readonly [number, number, number];
  rotation?: readonly [number, number, number];
}) {
  return shot.src ? (
    <RealPlane
      height={height}
      position={position}
      rotation={rotation}
      src={shot.src}
      width={width}
    />
  ) : (
    <PlaceholderPlane
      height={height}
      position={position}
      rotation={rotation}
      shot={shot}
      width={width}
    />
  );
}

function PlaceholderPlane({
  shot,
  width,
  height,
  position,
  rotation,
}: {
  shot: Shot;
  width: number;
  height: number;
  position: readonly [number, number, number];
  rotation?: readonly [number, number, number];
}) {
  // 캔버스 DOM 요소에서 읽는다 — `[data-tone]` 톤 서브트리 안에 있으므로 그 톤이
  // 재정의한 값을 본다(`texture.ts` 의 `readColorToken` 주석 참고). 톤이 없는
  // 라우트에서는 documentElement 로 물러나는 것과 값이 같다.
  const canvasEl = useThree((state) => state.gl.domElement);
  const texture = useMemo(() => {
    return getPlaceholderTexture(
      shot.width,
      shot.height,
      readColorToken("--ground-sub", canvasEl),
      readColorToken("--rule", canvasEl),
      readColorToken("--frame-mat", canvasEl),
      readColorToken("--ink-3", canvasEl),
      readColorToken("--frame-edge-lit", canvasEl),
      readColorToken("--frame-edge-shadow", canvasEl),
    );
  }, [shot.width, shot.height, canvasEl]);

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function RealPlane({
  src,
  width,
  height,
  position,
  rotation,
}: {
  src: string;
  width: number;
  height: number;
  position: readonly [number, number, number];
  rotation?: readonly [number, number, number];
}) {
  const texture = useTexture(src);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
