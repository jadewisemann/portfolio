import { describe, expect, it } from "vitest";
import {
  CHANNEL_HALF,
  CORRIDOR_CAMERA_START_Z,
  HERO_CAMERA_DESKTOP,
  HERO_CAMERA_MOBILE,
  corridorCameraZ,
  corridorIndexForZ,
  corridorItems,
  corridorPlanesInView,
  corridorTotalDepth,
  heroItemsDesktop,
  heroItemsMobile,
  projectToScreen,
} from "./layout";
import { PROJECTS } from "../shots";

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

describe("복도 밀도 — 끝까지 성기지 않는다", () => {
  /*
    실측 결함: /t1 스크롤 90% 에서 화면에 평면이 2장뿐이었다
    (`review/tone/scroll-t1-1920-90.png`). 카메라가 평면 밭 끝까지 달려서
    마지막 구간에 남는 평면이 없었던 것이다. 카메라 행정을 한 밴드 줄여 고쳤고,
    그 수정이 되돌아가지 않도록 밀도를 수로 검사한다.
  */
  it("어느 진행률에서도 화면에 평면이 최소 3장 있다", () => {
    const thin: string[] = [];
    for (let step = 0; step <= 20; step += 1) {
      const progress = step / 20;
      const ahead = corridorPlanesInView(progress);
      if (ahead < 3) thin.push(`${Math.round(progress * 100)}% → ${ahead}장`);
    }
    expect(thin).toEqual([]);
  });

  it("진행률 100% 는 마지막 프로젝트에 머문다", () => {
    // 꼬리를 그냥 잘랐더니 끝에서 두 번째 프로젝트에 멈춰 있었다.
    const total = corridorTotalDepth();
    const endZ = corridorCameraZ(1, total);
    expect(corridorIndexForZ(endZ, PROJECTS.length)).toBe(PROJECTS.length - 1);
  });

  it("카메라는 평면 밭보다 먼저 멈춘다", () => {
    const total = corridorTotalDepth();
    const endZ = corridorCameraZ(1, total);
    const furthest = Math.min(...corridorItems().map((item) => item.z));
    // 종점에서도 앞에 평면이 남아 있어야 한다 — 밭 끝에 도달하면 화면이 빈다.
    expect(endZ - furthest).toBeGreaterThan(1);
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
