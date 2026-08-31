"use client";

import { Canvas, useStore } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { PROJECTS } from "../shots";
import { ProjectMeta } from "../ProjectMeta";
import styles from "./GalleryScene.module.css";
import {
  buildCameraPath,
  CAMERA_START_Z,
  cameraOffsetForZ,
  indexForZ,
  layoutProjects,
  progressForZ,
  projectTargetZ,
  totalDepth,
} from "./layout";
import { ShotPlane } from "./ShotPlane";

const DEPTH = totalDepth(PROJECTS);
const PLACED = layoutProjects(PROJECTS);
const CAMERA_PATH = buildCameraPath(PLACED);

/**
 * 카메라 조종. 스크롤 · 포인터 값을 읽지만 rAF 루프를 돌지 않는다 —
 * 이벤트가 올 때만 `invalidate()` 를 불러 `frameloop="demand"` 프레임 하나를
 * 청구한다. 유휴 상태에서는 rAF 가 0건이다(MOTION_LANGUAGE.md 1.4 조건 4).
 *
 * 카메라 · 평면의 z 이동 · 회전은 이 씬의 좌표계에 속한다 — DOM 속성이 아니므로
 * "DOM 에서 scale·rotate 를 애니메이션하지 않는다"(MOTION_LANGUAGE.md 8절)의
 * 적용을 받지 않는다(같은 절이 명시하는 3D 씬 예외).
 */
/** 시차 최대 폭(world 단위). 스크롤이 만든 x·y 위에 더해지는 작은 흔들림이다. */
const PARALLAX_RANGE = 0.35;

function Rig({
  wrapperRef,
  onCameraZ,
}: {
  wrapperRef: RefObject<HTMLDivElement | null>;
  onCameraZ: (z: number) => void;
}) {
  // R3F 의 `camera` 는 살아있는 three.js 객체이고, 카메라를 움직이는 것 자체가
  // 이 씬의 정의다 — 매 프레임 재생성되는 리액트 상태가 아니라 하나의 정체성을
  // 유지한 채 자리만 바뀐다. `useThree()` 훅이 매 렌더 돌려주는 값을 직접
  // 변경하는 대신(react-hooks 불변성 규칙과 충돌한다) `useStore().getState()` 로
  // 매번 최신 스냅숏을 꺼내 쓴다 — 이 접근은 R3F 공식 문서가 명시한 "transient
  // update" 패턴이다.
  const store = useStore();

  // 스크롤이 만든 자리(카메라 경로)와 포인터가 만든 자리(시차)를 따로 들고
  // 매번 더해서 적용한다 — 두 이펙트가 각자 camera.position 을 덮어쓰면
  // 나중에 실행된 쪽이 먼저 것을 지운다.
  const baseXY = useRef({ x: 0, y: 0 });
  const parallaxXY = useRef({ x: 0, y: 0 });

  const applyCamera = useCallback(
    (z: number) => {
      const { camera, invalidate } = store.getState();
      camera.position.set(
        baseXY.current.x + parallaxXY.current.x,
        baseXY.current.y + parallaxXY.current.y,
        z,
      );
      invalidate();
    },
    [store],
  );

  useEffect(() => {
    applyCamera(CAMERA_START_Z);
  }, [applyCamera]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const applyScroll = () => {
      const rect = wrapper.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress =
        scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
      const z = CAMERA_START_Z - progress * DEPTH;
      const offset = cameraOffsetForZ(z, CAMERA_PATH);
      baseXY.current = offset;
      onCameraZ(z);
      applyCamera(z);
    };

    applyScroll();
    window.addEventListener("scroll", applyScroll, { passive: true });
    window.addEventListener("resize", applyScroll);
    return () => {
      window.removeEventListener("scroll", applyScroll);
      window.removeEventListener("resize", applyScroll);
    };
  }, [applyCamera, onCameraZ, wrapperRef]);

  useEffect(() => {
    // 손가락 시차는 만들지 않는다 — 정밀 포인터가 있는 기기에서만 켠다
    // (MOTION_LANGUAGE.md 11절의 hover 관행과 같은 경계).
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }
    const el = store.getState().gl.domElement;
    const onMove = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = (event.clientY / window.innerHeight) * 2 - 1;
      parallaxXY.current = { x: nx * PARALLAX_RANGE, y: ny * -PARALLAX_RANGE };
      applyCamera(store.getState().camera.position.z);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => el.removeEventListener("pointermove", onMove);
  }, [applyCamera, store]);

  return null;
}

function Field() {
  return (
    <>
      {PLACED.map((placed) => (
        <ShotPlane
          height={placed.height}
          key={`${placed.projectId}-${placed.shot.alt}`}
          position={placed.position}
          rotation={placed.rotation}
          shot={placed.shot}
          width={placed.width}
        />
      ))}
    </>
  );
}

function jumpTo(wrapper: HTMLDivElement, index: number) {
  const targetZ = projectTargetZ(index);
  const progress = progressForZ(targetZ, DEPTH);
  const rect = wrapper.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  const top = window.scrollY + rect.top + progress * Math.max(0, scrollable);
  // scroll-behavior 는 소유할 수 없는 지속 시간이므로 쓰지 않는다
  // (MOTION_LANGUAGE.md 5.3). 기본 동작(즉시 이동)에 맡긴다.
  window.scrollTo({ top });
}

/**
 * /f1 평면 갤러리. 화면에 걸린 평면들은 sticky 캔버스 하나이고, 카메라가 스크롤을
 * 따라 z 축으로 이동한다(돌리). 스크롤 이송 자체는 가로채지 않는다 — sticky 는
 * CSS 뿐이고, 브라우저 기본 스크롤 물리가 그대로 유지된다.
 *
 * 키보드 경로: 프로젝트 이름 버튼 3개가 포인터 시차 · 스크롤 돌리와 나란히 있다.
 * 포커스 · Enter/Space 로 그 프로젝트의 대역으로 즉시 이동한다.
 */
export function GalleryScene() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleCameraZ = useCallback((z: number) => {
    const index = indexForZ(z, PROJECTS.length);
    setActiveIndex((current) => (current === index ? current : index));
  }, []);

  const active = PROJECTS[activeIndex];

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.sticky}>
        <Canvas
          camera={{ position: [0, 0, CAMERA_START_Z], fov: 62 }}
          className={styles.canvas}
          dpr={[1, 2]}
          frameloop="demand"
        >
          <Rig onCameraZ={handleCameraZ} wrapperRef={wrapperRef} />
          <Field />
        </Canvas>

        <div className={styles.caption} key={active.id}>
          <ProjectMeta project={active} />
        </div>

        <nav aria-label="프로젝트로 이동" className={styles.nav}>
          {PROJECTS.map((project, index) => (
            <button
              aria-current={index === activeIndex ? "true" : undefined}
              className={styles.navButton}
              key={project.id}
              onClick={() => {
                const wrapper = wrapperRef.current;
                if (wrapper) jumpTo(wrapper, index);
              }}
              type="button"
            >
              {project.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
