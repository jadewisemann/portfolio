"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/motion-preference";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shader";
import { useThemeColors } from "./useThemeColors";
import styles from "./HeroBackdrop.module.css";

/** 팔레트에서 읽어 오는 세 색. 모듈 스코프 상수여야 훅이 매 렌더 다시 돌지 않습니다. */
const COLOR_TOKENS = ["--ground-2", "--ink-3", "--signal-built"] as const;

/**
 * 히어로 뒤의 덩어리.
 *
 * 자리: 넓은 화면에서는 **오른쪽**입니다. 이름이 왼쪽에서 측정폭을 채우고 오른쪽이
 * 비는 구도였는데, 그 빈자리가 이 물체의 자리입니다. 좁은 화면에서는 가운데로 오고
 * 이름 뒤에 깔립니다.
 *
 * 무엇에 반응하나:
 *   - 시간 — 형태가 천천히 흐릅니다.
 *   - 포인터 — 커서가 향한 쪽이 부풀어 오릅니다. 값은 프레임마다 감쇠 보간합니다.
 *   - 스크롤 — 히어로를 벗어나는 동안 물체가 뒤로 물러나고 회전이 빨라집니다.
 *
 * 스크롤 값을 리액트 상태로 올리지 않습니다. 프레임 안에서 `window.scrollY` 를 읽어
 * 유니폼에 직접 씁니다 — 매 프레임 리렌더를 만들지 않기 위해서입니다.
 */
function Blob({ reduced }: { reduced: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));

  const viewport = useThree((state) => state.viewport);
  const [bodyColor, litColor, rimColor] = useThemeColors(COLOR_TOKENS);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uAmplitude: { value: 1 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uColorBody: { value: new THREE.Color("#2e2a25") },
      uColorLit: { value: new THREE.Color("#8f887a") },
      uColorRim: { value: new THREE.Color("#7fbcc6") },
      uRimStrength: { value: 0.62 },
    }),
    [],
  );

  // 팔레트가 바뀌면 유니폼을 갈아 끼웁니다. 렌더 중이 아니라 값이 바뀔 때만 돕니다.
  uniforms.uColorBody.value.set(bodyColor);
  uniforms.uColorLit.value.set(litColor);
  uniforms.uColorRim.value.set(rimColor);

  /*
    넓은 화면에서는 오른쪽으로 밀고 크게, 좁은 화면에서는 가운데에 작게 둡니다.
    `viewport` 는 카메라 거리에서의 실제 월드 단위 크기이므로, 화면 폭이 바뀌어도
    물체가 차지하는 화면 비율이 유지됩니다.
  */
  const wide = viewport.width > 7;
  const radius = wide ? viewport.width * 0.155 : viewport.width * 0.3;
  const offsetX = wide ? viewport.width * 0.26 : 0;
  const offsetY = wide ? -viewport.height * 0.02 : viewport.height * 0.06;

  useFrame((state, delta) => {
    const uniform = material.current?.uniforms;
    const object = mesh.current;
    if (!uniform || !object) return;

    // 히어로를 벗어나는 진행도 0 → 1. 레이아웃을 다시 계산하지 않는 읽기입니다.
    const progress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);

    if (reduced) {
      // 축소 모션 — 한 장의 정지 이미지로 둡니다. 물체는 남고 움직임만 사라집니다.
      uniform.uTime.value = 8.4;
      uniform.uScroll.value = 0;
      uniform.uPointer.value.set(0, 0);
      object.rotation.set(0.3, 0.6, 0);
      object.position.set(offsetX, offsetY, 0);
      object.scale.setScalar(1);
      return;
    }

    uniform.uTime.value += delta;
    uniform.uScroll.value = progress;

    // 포인터를 따라가되 즉시 붙지 않습니다. 감쇠가 물체에 무게를 줍니다.
    pointer.current.lerp(state.pointer, 1 - Math.pow(0.0025, delta));
    uniform.uPointer.value.copy(pointer.current);

    object.rotation.y += delta * (0.09 + progress * 0.5);
    object.rotation.x = 0.22 + pointer.current.y * 0.18;

    // 스크롤과 함께 뒤로 물러나며 위로 빠집니다.
    object.position.set(
      offsetX + pointer.current.x * 0.22,
      offsetY + progress * viewport.height * 0.55,
      -progress * 2.2,
    );
    object.scale.setScalar(1 - progress * 0.18);
  });

  return (
    <mesh ref={mesh} position={[offsetX, offsetY, 0]}>
      {/*
        detail 이 높을수록 면이 잘아집니다. 24 는 각진 결정으로 읽히면서 실루엣이
        울퉁불퉁해 보이지 않는 최소값입니다 — 더 낮추면 덩어리가 다면체로 보입니다.
      */}
      <icosahedronGeometry args={[radius, 24]} />
      <shaderMaterial
        fragmentShader={FRAGMENT_SHADER}
        ref={material}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
      />
    </mesh>
  );
}

/**
 * 캔버스. 히어로가 화면 밖으로 나가면 `frameloop` 이 멈추므로, 페이지 아래쪽을 읽는
 * 동안 GPU 가 놀지 않습니다 — 그 판정은 부모(`HeroBackdropMount`)가 합니다.
 */
export default function HeroBackdrop({ active }: { active: boolean }) {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden="true" className={styles.canvas}>
      <Canvas
        camera={{ fov: 42, position: [0, 0, 6] }}
        dpr={[1, 1.75]}
        frameloop={active ? "always" : "never"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Blob reduced={reduced} />
      </Canvas>
    </div>
  );
}
