import { describe, expect, test } from "vitest";
import { SEAM_MIN, seam } from "./seam";

// 이음선의 위치가 데이터이므로, 이 파일은 시각 테스트가 아니라 **데이터 무결성 테스트**입니다.
// 여기가 통과하지 않으면 지면이 잘못된 수치를 그립니다.

describe("이음선", () => {
  test("실제 비율을 그린다", () => {
    // YORR 팀 구성: FE 본인 1명 : 그 외 5명 (CONTENT.md 2.1)
    const s = seam({ a: 1, b: 5, aLabel: "FE 1", bLabel: "그 외 5" });
    expect(s.actual).toBeCloseTo(16.666, 2);
    expect(s.percent).toBeCloseTo(16.666, 2);
    expect(s.clamped).toBe(false);
    expect(s.edge).toBe(null);
  });

  test("최소 폭보다 좁은 칸은 최소 폭으로 올리고 어긋남을 알린다", () => {
    // 3% 짜리 칸은 아무것도 담을 수 없으므로 올립니다. 대신 clamped 가 참이 되어
    // 호출하는 쪽이 실제 비율을 화면에 밝힙니다 (ART_DIRECTION.md 3.4).
    const s = seam({ a: 3, b: 97, aLabel: "a", bLabel: "b" });
    expect(s.percent).toBe(SEAM_MIN);
    expect(s.actual).toBe(3);
    expect(s.clamped).toBe(true);
  });

  test("반대쪽도 대칭으로 올린다", () => {
    const s = seam({ a: 97, b: 3, aLabel: "a", bLabel: "b" });
    expect(s.percent).toBe(100 - SEAM_MIN);
    expect(s.clamped).toBe(true);
  });

  test("0% 는 예외로 실제 0폭을 그린다", () => {
    // FF 역할 경계: 실시간 채팅 본인 커밋 0건 (CONTENT.md 3.7).
    // 「내가 한 일」 칸이 물리적으로 사라지는 것이 이 절의 서사 전부이므로
    // 최소 폭 보호를 적용하지 않습니다.
    const s = seam({ a: 0, b: 8, aLabel: "커밋 0", bLabel: "담당자 별도" });
    expect(s.percent).toBe(0);
    expect(s.clamped).toBe(false);
    expect(s.edge).toBe("a");
  });

  test("100% 는 예외로 전폭을 그린다", () => {
    // Pookjayo functions/src 10/10 단독 작성 (CONTENT.md 4.1).
    const s = seam({ a: 10, b: 0, aLabel: "본인 10", bLabel: "그 외 0" });
    expect(s.percent).toBe(100);
    expect(s.clamped).toBe(false);
    expect(s.edge).toBe("b");
  });

  test("분모가 0 이면 비교하지 않았다고 표시한다", () => {
    // 조용히 50% 를 그리면 「비교했다」는 거짓말이 됩니다.
    const s = seam({ a: 0, b: 0, aLabel: "a", bLabel: "b" });
    expect(s.clamped).toBe(true);
  });

  test("50 대 50 은 어긋나지 않는다", () => {
    const s = seam({ a: 1, b: 1, aLabel: "a", bLabel: "b" });
    expect(s.percent).toBe(50);
    expect(s.clamped).toBe(false);
  });
});
