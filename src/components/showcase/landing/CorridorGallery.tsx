"use client";

import { Canvas, useFrame, useStore } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { PROJECTS } from "../shots";
import { DepthFog } from "../DepthFog";
import { ProjectMeta } from "../ProjectMeta";
import { ShotPlane } from "../ShotPlane";
import {
  CORRIDOR_CAMERA_START_Z,
  CORRIDOR_FOV,
  CORRIDOR_JUMP_DURATION_MS,
  corridorCameraZ,
  corridorIndexForZ,
  corridorItems,
  corridorProgressForZ,
  corridorProjectTargetZ,
  corridorTotalDepth,
  easeSpine,
} from "./layout";
import styles from "./CorridorGallery.module.css";

const DEPTH = corridorTotalDepth(PROJECTS);
const ITEMS = corridorItems(PROJECTS);

/*
  깊이 안개의 near/far. 복도는 카메라가 스크롤을 따라 계속 움직이므로(`Rig`) 고정된
  근/원 값 하나가 모든 진행률에 완벽히 맞지는 않는다 — 대신 화면에 걸리는 평면들의
  전형적인 dz 범위(`corridorPlanesInView` 의 실측 창, VIEW_BEHIND=2 ~ DEPTH_PER_PROJECT
  근방)를 덮도록 잡는다. 결과: 항상 화면 앞쪽 평면은 밝고, 뒤쪽으로 갈수록 방 색
  (`--ground`)속으로 가라앉는다 — "복도가 어둠 속으로 이어진다"는 읽기를 스크롤
  위치와 무관하게 유지한다.
*/
const CORRIDOR_FOG_NEAR = 2.2;
const CORRIDOR_FOG_FAR = 13;

/**
 * 스크롤 이벤트가 만든 z 와 얼마나 가까우면 "방금 우리가 실행한 `jumpTo()` 의
 * 결과"로 볼지. `window.scrollTo` 가 정수 픽셀로 반올림하며 생기는 오차(총 이동
 * 거리 대비 0.5px 미만)보다 넉넉하지만, 실제 휠 · 키보드 스크롤 입력(수십 px
 * 이상)보다는 훨씬 촘촘하다 — 진짜 스크롤 입력과 프로그램이 만든 스크롤을
 * 가르는 값이지 물리적 정밀도가 아니다.
 */
const JUMP_MATCH_EPSILON = 0.01;

interface EasingState {
  active: boolean;
  fromZ: number;
  toZ: number;
  startTime: number;
}

/**
 * 카메라는 x=0 · y=0 에 고정한 채 z 만 스크롤을 따라 움직인다(`layout.ts` 의
 * 채널 불변식 참고 — /f1 의 죽은 프레임 결함을 배치 산술로 막았으므로 카메라가
 * 특정 평면을 피해 다닐 필요가 없다). rAF 루프를 돌지 않는다 — 이벤트가 올 때만
 * `invalidate()` 를 부른다(`frameloop="demand"`).
 *
 * 예외 하나: `jumpToIndex` 로 들어오는 점프. 스크롤 이송 자체(`window.scrollTo`)는
 * 여전히 즉시 실행하지만(MOTION_LANGUAGE.md §5.3, 소유할 수 없는 지속 시간을
 * 만들지 않는다), 화면에 그려지는 카메라 위치는 장면 간 대역(`--duration-spine`
 * 620ms, `--ease-spine`)에 걸쳐 옮긴다 — 전에는 2,430px 순간이동이 한 프레임에
 * 일어났다. 카메라 변환은 씬의 좌표계에 속해 DOM 속성이 아니므로
 * `MOTION_LANGUAGE.md` §8 의 DOM 속성 제한을 받지 않는다(§1.4·§6, 3D 씬 안의
 * 명시적 변환).
 */
function Rig({
  wrapperRef,
  onCameraZ,
  jumpToIndex,
  onJumpHandled,
}: {
  wrapperRef: RefObject<HTMLDivElement | null>;
  onCameraZ: (z: number) => void;
  jumpToIndex: number | null;
  onJumpHandled: () => void;
}) {
  const store = useStore();
  const lastZRef = useRef(CORRIDOR_CAMERA_START_Z);
  const easingRef = useRef<EasingState | null>(null);

  const applyCamera = useCallback(
    (z: number) => {
      const { camera, invalidate } = store.getState();
      camera.position.set(0, 0, z);
      lastZRef.current = z;
      invalidate();
    },
    [store],
  );

  useEffect(() => {
    applyCamera(CORRIDOR_CAMERA_START_Z);
  }, [applyCamera]);

  // 트윈 루프. `frameloop="demand"` 아래에서는 `invalidate()` 가 프레임 하나만
  // 예약하므로, 애니메이션 중에는 매 프레임 `applyCamera` 가 다시 `invalidate()`
  // 를 불러 다음 프레임을 잇는다. `easing.active` 가 꺼지면 더는 부르지 않으므로
  // 유휴 상태의 rAF 는 0으로 돌아온다.
  useFrame(() => {
    const easing = easingRef.current;
    if (!easing || !easing.active) return;
    const elapsed = performance.now() - easing.startTime;
    const t = Math.min(1, elapsed / CORRIDOR_JUMP_DURATION_MS);
    const z = easing.fromZ + (easing.toZ - easing.fromZ) * easeSpine(t);
    if (t >= 1) easing.active = false;
    applyCamera(z);
    onCameraZ(z);
  });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const applyScroll = () => {
      const rect = wrapper.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress =
        scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
      const z = corridorCameraZ(progress, DEPTH);

      const easing = easingRef.current;
      if (easing?.active && Math.abs(z - easing.toZ) < JUMP_MATCH_EPSILON) {
        // 이 scroll 이벤트는 방금 실행한 jumpTo() 자신이 만든 것이다 — 트윈이
        // 이미 카메라를 옮기고 있으므로 여기서 다시 스냅하지 않는다.
        return;
      }
      // 실제 스크롤 입력이 도착했다 — 진행 중이던 트윈이 있어도 그 입력이 이긴다
      // (스크롤 이송은 절대 가로채지 않는다, MOTION_LANGUAGE.md §5.1·§5.3).
      if (easing) easing.active = false;

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
    if (jumpToIndex === null) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      onJumpHandled();
      return;
    }

    const targetZ = corridorProjectTargetZ(jumpToIndex);
    const progress = corridorProgressForZ(targetZ, DEPTH);
    const rect = wrapper.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    const top = window.scrollY + rect.top + progress * Math.max(0, scrollable);

    easingRef.current = {
      active: true,
      fromZ: lastZRef.current,
      toZ: targetZ,
      startTime: performance.now(),
    };
    // scroll-behavior 는 소유할 수 없는 지속 시간이므로 쓰지 않는다
    // (MOTION_LANGUAGE.md §5.3). 스크롤 이송 자체는 기본 동작(즉시 이동)에 맡기고,
    // 카메라 위치만 위 트윈이 담당한다.
    window.scrollTo({ top });
    // frameloop="demand" 는 invalidate() 가 없으면 렌더하지 않는다 — 트윈의 첫
    // 프레임을 깨운다(카메라 값 자체는 바꾸지 않는다).
    applyCamera(lastZRef.current);
    onJumpHandled();
  }, [applyCamera, jumpToIndex, onJumpHandled, wrapperRef]);

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

/**
 * 랜딩(`/`)의 복도 갤러리. 이전 `/f1` 과 같은 표준 기법(브라우저 기본 스크롤 위에 sticky
 * 캔버스, 카메라가 스크롤을 따라 z 축으로 이동)을 쓰되, 배치 산술을 바꿔
 * "카메라가 평면 안으로 들어간다" 결함을 원천적으로 막는다(`layout.ts` 참고).
 *
 * 키보드 경로: 프로젝트 이름 버튼 3개가 포인터 · 스크롤 돌리와 나란히 있다.
 */
export function CorridorGallery() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [jumpToIndex, setJumpToIndex] = useState<number | null>(null);

  const handleCameraZ = useCallback((z: number) => {
    const index = corridorIndexForZ(z, PROJECTS.length);
    setActiveIndex((current) => (current === index ? current : index));
  }, []);

  const handleJumpHandled = useCallback(() => {
    setJumpToIndex(null);
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
          <Rig
            jumpToIndex={jumpToIndex}
            onCameraZ={handleCameraZ}
            onJumpHandled={handleJumpHandled}
            wrapperRef={wrapperRef}
          />
          <DepthFog far={CORRIDOR_FOG_FAR} near={CORRIDOR_FOG_NEAR} />
          <Field />
        </Canvas>

        {/*
          WebGL 캔버스는 스크린리더에 아무것도 노출하지 않는다 — `ShotPlane` 은
          텍스처만 그리고 `shot.alt` 를 읽지 않는다. 지금 화면에 있는(활성)
          프로젝트의 샷만 알려준다 — 캡션이 가리키는 것과 같은 범위다
          (WCAG 1.1.1).
        */}
        <ul className="sr-only">
          {active.shots.map((shot, index) => (
            <li key={`${active.id}-${index}`}>{shot.alt}</li>
          ))}
        </ul>

        <div className={styles.caption} key={active.id}>
          <ProjectMeta project={active} />
        </div>

        <nav aria-label="프로젝트로 이동" className={styles.nav}>
          {PROJECTS.map((project, index) => (
            <button
              aria-current={index === activeIndex ? "true" : undefined}
              className={styles.navButton}
              key={project.id}
              onClick={() => setJumpToIndex(index)}
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
