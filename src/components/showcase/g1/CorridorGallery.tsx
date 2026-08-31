"use client";

import { Canvas, useStore } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { PROJECTS } from "../shots";
import { ProjectMeta } from "../ProjectMeta";
import { ShotPlane } from "../f1/ShotPlane";
import {
  CORRIDOR_CAMERA_START_Z,
  CORRIDOR_FOV,
  corridorCameraZ,
  corridorIndexForZ,
  corridorItems,
  corridorProgressForZ,
  corridorProjectTargetZ,
  corridorTotalDepth,
} from "./layout";
import styles from "./CorridorGallery.module.css";

const DEPTH = corridorTotalDepth(PROJECTS);
const ITEMS = corridorItems(PROJECTS);

/**
 * 카메라는 x=0 · y=0 에 고정한 채 z 만 스크롤을 따라 움직인다(`layout.ts` 의
 * 채널 불변식 참고 — /f1 의 죽은 프레임 결함을 배치 산술로 막았으므로 카메라가
 * 특정 평면을 피해 다닐 필요가 없다). rAF 루프를 돌지 않는다 — 이벤트가 올 때만
 * `invalidate()` 를 부른다(`frameloop="demand"`).
 */
function Rig({
  wrapperRef,
  onCameraZ,
}: {
  wrapperRef: RefObject<HTMLDivElement | null>;
  onCameraZ: (z: number) => void;
}) {
  const store = useStore();

  const applyCamera = useCallback(
    (z: number) => {
      const { camera, invalidate } = store.getState();
      camera.position.set(0, 0, z);
      invalidate();
    },
    [store],
  );

  useEffect(() => {
    applyCamera(CORRIDOR_CAMERA_START_Z);
  }, [applyCamera]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const applyScroll = () => {
      const rect = wrapper.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress =
        scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
      const z = corridorCameraZ(progress, DEPTH);
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

  return null;
}

function Field() {
  return (
    <>
      {ITEMS.map((item) => (
        <ShotPlane
          height={item.height}
          key={item.key}
          position={[item.x, item.y, item.z]}
          rotation={[0, item.rotY, item.rotZ]}
          shot={item.shot}
          width={item.width}
        />
      ))}
    </>
  );
}

function jumpTo(wrapper: HTMLDivElement, index: number) {
  const targetZ = corridorProjectTargetZ(index);
  const progress = corridorProgressForZ(targetZ, DEPTH);
  const rect = wrapper.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  const top = window.scrollY + rect.top + progress * Math.max(0, scrollable);
  // scroll-behavior 는 소유할 수 없는 지속 시간이므로 쓰지 않는다
  // (MOTION_LANGUAGE.md 5.3). 기본 동작(즉시 이동)에 맡긴다.
  window.scrollTo({ top });
}

/**
 * /g1 의 복도 갤러리. `/f1` 과 같은 표준 기법(브라우저 기본 스크롤 위에 sticky
 * 캔버스, 카메라가 스크롤을 따라 z 축으로 이동)을 쓰되, 배치 산술을 바꿔
 * "카메라가 평면 안으로 들어간다" 결함을 원천적으로 막는다(`layout.ts` 참고).
 *
 * 키보드 경로: 프로젝트 이름 버튼 3개가 포인터 · 스크롤 돌리와 나란히 있다.
 */
export function CorridorGallery() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleCameraZ = useCallback((z: number) => {
    const index = corridorIndexForZ(z, PROJECTS.length);
    setActiveIndex((current) => (current === index ? current : index));
  }, []);

  const active = PROJECTS[activeIndex];

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.sticky}>
        <Canvas
          camera={{ position: [0, 0, CORRIDOR_CAMERA_START_Z], fov: CORRIDOR_FOV }}
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
