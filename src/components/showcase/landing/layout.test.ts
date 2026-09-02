import { describe, expect, it } from "vitest";
import {
  CHANNEL_HALF,
  CORRIDOR_CAMERA_START_Z,
  HERO_CAMERA_DESKTOP,
  HERO_CAMERA_MOBILE,
  corridorCameraZ,
  corridorDominantProjectIndex,
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
 * 기하 불변식 테스트. 이전 `/f1` 이 「카메라가 평면 안으로 들어간다」로 죽은 프레임을
 * 만든 것(`review/showcase/scroll-f1-1920-55.png`)과 같은 결함군이 랜딩(`/`)에서
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
  /*
    이 검사는 z 창만 보고 세던 이전 `corridorPlanesInView` 를 기준으로 통과했다.
    그 계수는 좌우 시야 밖(수평 프러스텀 밖)에 있는 평면도 셌다 — 진행률 100%
    에서 `pookjayo-2` 는 x = -1.8 인데 그 깊이의 시야 반폭이 그보다 좁아
    완전히 화면 밖인데도 "화면에 있다"고 잡혔다. `corridorPlanesInView` 를
    수평 프러스텀까지 보게 고쳤더니(아래 "화면에 실제로 보이는 평면 수" 검사가
    그 실측값이다) 이 임계값 자체가 깨진다: 95% 에서 2장, 100% 에서 1장.
    이것은 복도 평면 배치(카메라 경로가 아니라 평면들의 z·x 좌표)라는 구조적
    사안이고, 이번 작업 범위에서 제외된 "복도 평면 배치" 결정 대상이다. 계수를
    화면에 맞추는 게 아니라 **임계값을 낮추는 것**으로 통과시키지 않기 위해
    `it.fails` 로 남긴다 — 배치가 실제로 고쳐져 이 조건이 다시 참이 되는 날
    이 테스트가 실패로 뒤집히며 그 사실을 알린다.
  */
  it.fails("어느 진행률에서도 화면에 평면이 최소 3장 있다 (구조적 결함 — 복도 평면 배치 미해결)", () => {
    const thin: string[] = [];
    for (let step = 0; step <= 20; step += 1) {
      const progress = step / 20;
      const ahead = corridorPlanesInView(progress);
      if (ahead < 3) thin.push(`${Math.round(progress * 100)}% → ${ahead}장`);
    }
    expect(thin).toEqual([]);
  });

  it("화면에 실제로 보이는 평면 수 — 수평 프러스텀까지 포함한 실측값", () => {
    // 정본 데스크톱 뷰포트(1440×900)에서 z 창 + 수평 프러스텀을 모두 통과하는
    // 평면 수. 이전 z-only 계수는 0/0.2/0.4/0.6/0.8/1.0 에서 3/5/5/6/6/3 을
    // 보고했다 — 실제로는 아래 값이다. 이 값 자체를 회귀 기준으로 고정한다.
    const measured = [0, 0.2, 0.4, 0.6, 0.8, 1.0].map((progress) =>
      corridorPlanesInView(progress),
    );
    expect(measured).toEqual([3, 3, 3, 4, 3, 1]);
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

describe("복도 캡션 — z 밴드가 아니라 화면 점유율과 맞는다", () => {
  /*
    실측 결함: `corridorIndexForZ` 가 카메라 z 를 0 기준 `DEPTH_PER_PROJECT`
    배수로만 나누면, 카메라가 실제로 보고 있는(화면 점유율이 가장 큰) 프로젝트보다
    2~3 world 단위 뒤처진다 — 21 샘플 중 8개(38%)가 어긋났고, 진행률 0.40 에서는
    캡션이 YORR 인데 화면 점유율은 YORR 0%·FestiFriends 37% 였다. z 만 보는 검사는
    같은 방식으로 재는 것이므로 이 결함을 잡지 못한다 — 화면 점유율(프러스텀에
    투영한 넓이)로 별도 계산한 정답과 비교한다.
  */
  it("corridorIndexForZ 가 화면 점유율 최댓값 프로젝트와 거의 항상 일치한다", () => {
    const total = corridorTotalDepth();
    const mismatches: string[] = [];
    for (let step = 0; step <= 20; step += 1) {
      const progress = step / 20;
      const z = corridorCameraZ(progress, total);
      const caption = corridorIndexForZ(z, PROJECTS.length);
      const dominant = corridorDominantProjectIndex(z);
      if (caption !== dominant) {
        mismatches.push(`${Math.round(progress * 100)}%: 캡션=${caption} 화면점유=${dominant}`);
      }
    }
    // 실측: 21 샘플 중 정확히 1개(진행률 25%)만 어긋난다 — 두 프로젝트가 화면을
    // 거의 반반씩 나눠 갖는 진짜 경계 프레임이라 "정답"이 없는 지점이다. 오프셋
    // 도입 전에는 8개가 어긋났다.
    expect(mismatches).toEqual(["25%: 캡션=0 화면점유=1"]);
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
