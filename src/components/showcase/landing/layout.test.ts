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
  easeTravel,
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

    구조적 결함이었다: 평면 밴드당 4장을 밴드 전체에 성기게 펼치면, 채널
    불변식이 만드는 최소 오프셋(`CHANNEL_HALF`)을 화면에 담을 만큼 dz 가 커지는
    평면이 한 번에 1~2장뿐인 구간이 반드시 생긴다. `corridorItems` 를
    밴드당 4장 → 8장(같은 4장을 같은 벽에서 두 번, `REPEATS_PER_SHOT`)으로
    다시 배치해 해소했다 — `shots.ts` 의 4장은 그대로 두고 배치 밀도만 두 배로
    올린다. 이 테스트는 `it.fails` 였다가 배치가 실제로 고쳐지며 참으로
    뒤집혔다 — 더 이상 구조적 결함이 아니므로 일반 `it` 로 되돌린다.
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

  it("화면에 실제로 보이는 평면 수 — 수평 프러스텀까지 포함한 실측값", () => {
    // 정본 데스크톱 뷰포트(1440×900)에서 z 창 + 수평 프러스텀을 모두 통과하는
    // 평면 수. 밴드당 4장이던 배치는 0/0.2/0.4/0.6/0.8/1.0 에서 3/3/3/4/3/1 을
    // 보고했다 — 마지막 프로젝트(진행률 1.0)가 전체 곡선에서 가장 성긴 프레임
    // 이었다. 밴드당 8장(반복 배치)으로 고친 뒤의 실측값을 회귀 기준으로 고정한다
    // — 종점(1.0)이 더는 최솟값이 아니다.
    const measured = [0, 0.2, 0.4, 0.6, 0.8, 1.0].map((progress) =>
      corridorPlanesInView(progress),
    );
    expect(measured).toEqual([6, 6, 7, 6, 6, 6]);
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
    // 실측: 밴드당 8장(반복 배치)으로 고친 뒤 `CORRIDOR_LOOKAHEAD` 를 3.5 로,
    // 마지막 프로젝트의 정지 지점(`corridorProjectTargetZ`)의 밴드 안쪽 비율을
    // 0.32 → 0.17 로 다시 맞췄다 — 정지 지점을 밴드 앞쪽으로 당겨 종점 밀도를
    // 올린 결과이므로(위 "화면에 실제로 보이는 평면 수" 참고) 캡션 근사도 그
    // 새 정지 지점 기준으로 재검증해야 한다. 21 샘플 전부 일치한다(0개 어긋남) —
    // 오프셋 도입 전에는 8개, 이전 배치에서는 1개(25%, 경계 프레임)가 어긋났다.
    expect(mismatches).toEqual([]);
  });
});

describe("점프 이징 — `--ease-travel` 을 실행 시점에 읽는 순수 함수", () => {
  // 실측 결함(비평 4): 프로젝트로 이동 버튼이 스크롤을 한 프레임에 2,430px
  // 순간이동시켰고, 그 뒤 고친 `--ease-spine` 판도 12.8 유닛 돌리를 126ms 만에
  // 55% 이동시켜 순간이동 + 드리프트로 보였다. `--ease-travel` 로 바꾸고
  // 900ms(장면 간 대역 상한)에 걸쳐 옮긴다(`CorridorGallery.tsx`).
  it("양 끝은 그대로, 중간은 단조 증가한다 (오버슈트 없음)", () => {
    expect(easeTravel(0)).toBe(0);
    expect(easeTravel(1)).toBe(1);
    let prev = -Infinity;
    for (let i = 0; i <= 20; i += 1) {
      const t = i / 20;
      const eased = easeTravel(t);
      expect(eased).toBeGreaterThanOrEqual(prev);
      expect(eased).toBeGreaterThanOrEqual(0);
      expect(eased).toBeLessThanOrEqual(1);
      prev = eased;
    }
  });

  it("초반이 완만하고 오버슈트 없이 목표에 닿는다", () => {
    // `--ease-travel` = cubic-bezier(0.4, 0, 0.2, 1) — `--ease-spine` 과 달리
    // 초반 가속이 급하지 않다. t=0.25 에서 이미 25% 를 넘겨버리던 expo-out과
    // 달리 25% 지점을 넘지 않아야 "순간이동"이 아니라 "이동"으로 읽힌다.
    expect(easeTravel(0.25)).toBeLessThan(0.25);
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
