"use client";

import * as THREE from "three";

/**
 * R3F 평면용 자리표시자 텍스처. `PlaceholderFrame.tsx` 의 DOM 버전과 같은 규칙 —
 * 바깥 테두리(--ink-3) · 매트(--frame-mat) · 안쪽 면(--ground-sub, --rule 테두리) —
 * 을 캔버스에 그대로 옮긴다. 두 렌더러(DOM · WebGL)가 같은 자리표시자 언어를
 * 쓰게 하기 위해서다.
 *
 * 결함 수정 (GOLDEN_FIX 2, "the scene has no light"): 이전 구현은 매트 밴드를
 * `--frame-mat` 이 아니라 `--ground`(방의 색)로 채웠다 — 방과 매트가 같은 값이라
 * 매트가 방 배경 속으로 사라졌고, WebGL 액자는 테두리선 하나와 안쪽 면 하나,
 * 실질 두 값만 남았다(DOM 은 세 값이 다 보인다). 매트 자리를 `--frame-mat` 의
 * 밝힌 값(`edgeLit`)과 낮춘 값(`edgeShadow`)으로 가른 경사로 채워 DOM 과 같은
 * 3단 액자를(이번엔 빛까지 받는 채로) 복원한다. `frameMat` 인자는 지금 캐시
 * 키에만 쓰인다 — 톤이 바뀌면(따라서 edgeLit/edgeShadow 도 바뀌면) 이미 그
 * 둘이 캐시 키에 들어 있으므로 중복이지만, 매트의 "중립값"이 필요해지면(예:
 * 세 번째 색조) 참조할 자리로 남겨 둔다.
 *
 * 캐시 키에 색을 포함한다 — 라이트/다크 전환 시 같은 크기라도 다른 텍스처가 필요하다.
 */
const cache = new Map<string, THREE.CanvasTexture>();

export function getPlaceholderTexture(
  width: number,
  height: number,
  groundSub: string,
  rule: string,
  frameMat: string,
  ink3: string,
  edgeLit: string,
  edgeShadow: string,
): THREE.CanvasTexture {
  const key = `${width}x${height}:${groundSub}:${rule}:${frameMat}:${ink3}:${edgeLit}:${edgeShadow}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // 바깥 테두리 + 마운트 + 안쪽 면. PlaceholderFrame.module.css 와 같은 순서다.
    /*
      선 두께를 `scale`(2, CSS 1px 상당) 이 아니라 `scale * 3` 으로 굽는다. 이
      텍스처는 대부분의 프레임에서 화면 표시 크기보다 훨씬 크므로(원거리 축소,
      `DepthFog` 의 dz 가 클수록 더) GPU 밉맵이 1px 선을 화면 1px 미만으로
      뭉개 사라지게 만든다 — 실측: 화면 선폭이 채 1px 이 안 되면 대비가
      DETAIL 임계값 아래로 내려간다. 원본을 3배 굵게 구우면 축소된 뒤에도
      1px 이상이 남는다. DOM 포스터의 1px 테두리(`PlaceholderFrame.module.css`)
      는 그대로 둔다 — 브라우저가 직접 래스터화하므로 밉맵 손실이 없다.
    */
    const lineWidth = scale * 5;
    const mat = 6 * scale;

    /*
      매트의 경사(bevel) — 좌상단 하나의 빛, 사이트 전체 액자에 같은 방향으로
      (PlaceholderFrame.module.css 의 inset box-shadow 와 같은 관례: 빛을 받는
      면은 밝게, 등진 면은 어둡게). 대각선으로 가른 두 삼각형이 캔버스 전체를
      빈틈없이 덮는다 — 안쪽 면(아래에서 groundSub 로 덮어 잘라낸다)과 바깥
      테두리를 그리기 전에 밑칠로 깔아, 마운트 링에서만 그 경사가 보이게 한다.
      흐림 없이 하드 엣지다 — MOTION_LANGUAGE.md §7 "블러 언어: 없다".
    */
    ctx.fillStyle = edgeLit;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = edgeShadow;
    ctx.beginPath();
    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();

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

/**
 * 실제 계산된 토큰 값을 읽는다. three.js 머티리얼은 CSS 변수를 모른다.
 *
 * `el` 을 반드시 씬의 DOM 요소(캔버스 등)로 넘겨라 — `document.documentElement` 로
 * 고정하면 `[data-tone="t1"]` 처럼 라우트 루트보다 아래에서 재정의된 토큰을 못 읽는다
 * (커스텀 프로퍼티는 아래로만 상속되고, `documentElement` 는 그 톤 서브트리의 조상이라
 * 값이 안 보인다). 캔버스 DOM 요소는 톤이 걸린 서브트리 **안**에 있으므로 항상 맞는
 * 값을 읽는다. 인자를 생략하면 기존과 같이 `document.documentElement` 로 물러난다 —
 * 톤이 없는 라우트(`/f1` 등)에서는 그 값이 곧 유일한 값이므로 동작이 같다.
 */
export function readColorToken(name: string, el?: Element): string {
  if (typeof window === "undefined") return "#f1efea";
  const target = el ?? document.documentElement;
  return getComputedStyle(target).getPropertyValue(name).trim();
}
