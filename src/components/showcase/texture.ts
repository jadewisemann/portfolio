"use client";

import * as THREE from "three";

/**
 * R3F 평면용 자리표시자 텍스처. `PlaceholderFrame.tsx` 의 DOM 버전과 같은 규칙 —
 * 평평한 `--ground-sub` 면에 `--rule` 두께 1px 테두리, 가짜 UI 없음 — 을 캔버스에
 * 그대로 옮긴다. 두 렌더러(DOM · WebGL)가 같은 자리표시자 언어를 쓰게 하기 위해서다.
 *
 * 캐시 키에 색을 포함한다 — 라이트/다크 전환 시 같은 크기라도 다른 텍스처가 필요하다.
 */
const cache = new Map<string, THREE.CanvasTexture>();

export function getPlaceholderTexture(
  width: number,
  height: number,
  groundSub: string,
  rule: string,
  ground: string,
  ink3: string,
): THREE.CanvasTexture {
  const key = `${width}x${height}:${groundSub}:${rule}:${ground}:${ink3}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // 바깥 테두리 + 마운트 + 안쪽 면. PlaceholderFrame.module.css 와 같은 순서다.
    const lineWidth = scale;
    const mat = 6 * scale;

    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = ink3;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(
      lineWidth / 2,
      lineWidth / 2,
      canvas.width - lineWidth,
      canvas.height - lineWidth,
    );

    ctx.fillStyle = groundSub;
    ctx.fillRect(mat, mat, canvas.width - mat * 2, canvas.height - mat * 2);

    ctx.strokeStyle = rule;
    ctx.strokeRect(
      mat + lineWidth / 2,
      mat + lineWidth / 2,
      canvas.width - mat * 2 - lineWidth,
      canvas.height - mat * 2 - lineWidth,
    );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  cache.set(key, texture);
  return texture;
}

/** 문서 루트에서 실제 계산된 토큰 값을 읽는다. three.js 머티리얼은 CSS 변수를 모른다. */
export function readColorToken(name: string): string {
  if (typeof window === "undefined") return "#f1efea";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
