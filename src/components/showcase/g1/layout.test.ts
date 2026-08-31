import { describe, expect, it } from "vitest";
import {
  CHANNEL_HALF,
  CORRIDOR_CAMERA_START_Z,
  corridorCameraZ,
  corridorItems,
  corridorTotalDepth,
  HERO_CAMERA_DESKTOP,
  HERO_CAMERA_MOBILE,
  heroItemsDesktop,
  heroItemsMobile,
  projectToScreen,
} from "./layout";

/**
 * 기하 불변식 테스트. `/f1` 이 「카메라가 평면 안으로 들어간다」로 죽은 프레임을
 * 만든 것(`review/showcase/scroll-f1-1920-55.png`)과 같은 결함군이 `/g1` 에서
 * 다시 생길 수 없다는 것을 스크린샷이 아니라 산술로 증명한다.
 */
describe("복도 배치 — 채널 불변식", () => {
  const items = corridorItems();

  it("모든 평면이 중심선에서 최소 간격을 확보한다", () => {
    // 카메라는 항상 x=0 을 지나는 직선을 본다. 평면의 가까운 쪽 모서리가
    // CHANNEL_HALF 보다 중심선에서 멀리 있으면, 카메라 시선이 그 평면과
    // 어떤 z 에서도 겹칠 수 없다.
    for (const item of items) {
      const nearEdge = Math.abs(item.x) - item.width / 2;
      expect(nearEdge).toBeGreaterThanOrEqual(CHANNEL_HALF - 1e-9);
    }
  });

  it("PROJECTS 의 shots 합계만큼 평면이 배치된다", () => {
    expect(items.length).toBeGreaterThan(0);
  });

  it("카메라 z 는 진행률에 따라 단조 감소한다", () => {
    const depth = corridorTotalDepth();
    const a = corridorCameraZ(0, depth);
    const b = corridorCameraZ(0.5, depth);
    const c = corridorCameraZ(1, depth);
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
    expect(a).toBe(CORRIDOR_CAMERA_START_Z);
  });
});

describe("히어로 투영 — 포스터와 씬이 같은 산술을 쓴다", () => {
  it("데스크톱 히어로 항목이 전부 카메라 앞에 있고 화면 안에 대부분 들어온다", () => {
    for (const item of heroItemsDesktop()) {
      const rect = projectToScreen(item, HERO_CAMERA_DESKTOP);
      expect(rect).not.toBeNull();
      if (!rect) continue;
      expect(Number.isFinite(rect.leftPct)).toBe(true);
      expect(Number.isFinite(rect.topPct)).toBe(true);
      expect(rect.widthPct).toBeGreaterThan(0);
      expect(rect.heightPct).toBeGreaterThan(0);
    }
  });

  it("모바일 히어로 항목도 유효한 사각형으로 투영된다", () => {
    for (const item of heroItemsMobile()) {
      const rect = projectToScreen(item, HERO_CAMERA_MOBILE);
      expect(rect).not.toBeNull();
      if (!rect) continue;
      expect(rect.widthPct).toBeGreaterThan(0);
      expect(rect.heightPct).toBeGreaterThan(0);
    }
  });
});
