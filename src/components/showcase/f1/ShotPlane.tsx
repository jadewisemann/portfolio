"use client";

import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import type { Shot } from "../shots";
import { getPlaceholderTexture, readColorToken } from "../texture";

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
  const texture = useMemo(() => {
    const ground = readColorToken("--ground-sub");
    const rule = readColorToken("--rule");
    return getPlaceholderTexture(shot.width, shot.height, ground, rule);
  }, [shot.width, shot.height]);

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
