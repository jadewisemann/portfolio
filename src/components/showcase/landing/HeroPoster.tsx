import { PlaceholderFrame } from "../PlaceholderFrame";
import {
  HERO_CAMERA_DESKTOP,
  HERO_CAMERA_MOBILE,
  heroItemsDesktop,
  heroItemsMobile,
  projectToScreen,
  type Item,
} from "./layout";
import styles from "./HeroPoster.module.css";

/**
 * 히어로의 정적 포스터. WebGL 없음 · JS 없음 · 축소 모션 셋 다 이것 하나로
 * 향한다(MOTION_LANGUAGE.md 1.4) — 그리고 이것은 **첫 페인트 자체**이기도 하다.
 * `HeroDiorama` 가 씬을 켤지 결정하기 전까지, 서버 HTML 과 첫 클라이언트 렌더는
 * 항상 이 포스터다. 좌표는 `layout.ts` 의 `projectToScreen` 이 계산한다 — CSS 에
 * 손으로 옮겨 적은 숫자가 하나도 없으므로 씬과 어긋날 수 없다.
 *
 * 768px 를 기준으로 두 구성을 전부 마크업에 두고 CSS 미디어 쿼리로 가른다.
 * JS 없이도 뷰포트에 맞는 구성이 보여야 하기 때문이다(스크립트로 너비를 재서
 * 조건부 렌더링하면 JS 가 없는 방문자는 아무 것도 못 본다).
 */
function Frames({ items, aspect, dataSet }: {
  items: readonly Item[];
  aspect: { fovDeg: number; aspect: number; x: number; y: number; z: number };
  dataSet: "desktop" | "mobile";
}) {
  return (
    <div aria-hidden="true" className={styles.frames} data-set={dataSet}>
      {items.map((item) => {
        const rect = projectToScreen(item, aspect);
        if (!rect) return null;
        return (
          <PlaceholderFrame
            className={styles.frame}
            key={item.key}
            shot={item.shot}
            style={{
              left: `${rect.leftPct}%`,
              top: `${rect.topPct}%`,
              width: `${rect.widthPct}%`,
              height: `${rect.heightPct}%`,
              zIndex: rect.zIndex,
              transform: `translate(-50%, -50%) rotate(${rect.rotateDeg}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}

export function HeroPoster() {
  return (
    <>
      <Frames aspect={HERO_CAMERA_DESKTOP} dataSet="desktop" items={heroItemsDesktop()} />
      <Frames aspect={HERO_CAMERA_MOBILE} dataSet="mobile" items={heroItemsMobile()} />
    </>
  );
}
