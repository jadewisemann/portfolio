import { describe, expect, test } from "vitest";
import { computeSpine, spineX } from "./spine";

describe("척추", () => {
  test("일반 비율은 콜론 라벨을 만든다", () => {
    const g = computeSpine({ a: 1, b: 5, aLabel: "FE 1", bLabel: "그 외 5" });
    expect(g.label).toBe("1 : 5");
    expect(g.edge).toBe(null);
  });

  test("0% 절은 퍼센트 라벨이고 분수를 지어내지 않는다", () => {
    const g = computeSpine({ a: 0, b: 1, aLabel: "본인", bLabel: "담당자" });
    expect(g.label).toBe("0%");
    expect(g.edge).toBe("a");
    expect(g.percent).toBe(0);
  });

  test("100% 절은 퍼센트 라벨이다", () => {
    const g = computeSpine({ a: 1, b: 0, aLabel: "본인", bLabel: "그 외" });
    expect(g.label).toBe("100%");
    expect(g.edge).toBe("b");
    expect(g.percent).toBe(100);
  });

  test("픽셀 x 좌표는 정수로 반올림된다", () => {
    expect(spineX(16.666, 1441)).toBe(Math.round(0.16666 * 1441));
    expect(spineX(0, 1920)).toBe(0);
    expect(spineX(100, 1920)).toBe(1920);
  });
});
