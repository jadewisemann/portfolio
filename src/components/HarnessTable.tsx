import type { Reading } from "@/lib/reading";

/**
 * E2E 2단 하네스.
 *
 * SCENE_GRAPH.md 는 「행=디바이스 4종, 열=mock/real」 교차표를 제안했지만
 * **디바이스별 스펙 수는 정본에 기록되어 있지 않습니다.** 지어내지 않고 단으로만
 * 나누고, 디바이스 목록은 별도 줄에 둡니다.
 *
 * 실제 table 이므로 스크린리더가 구조를 그대로 읽습니다. 모션 소유자 없음.
 */
export function HarnessTable({
  rows,
  devices,
  caption,
}: {
  rows: readonly { tier: string; reading: Reading; verifies: string }[];
  devices: Reading;
  caption: string;
}) {
  return (
    <div aria-label={caption} className="scroll-x" role="region" tabIndex={0}>
      <table className="w-full min-w-[28rem] border-collapse font-mono text-note leading-5">
        <caption className="pb-2 text-left text-ink-3">{caption}</caption>
        <thead>
          <tr className="border-y border-rule text-ink-2">
            <th className="py-2 pr-4 text-left font-normal" scope="col">
              단
            </th>
            <th className="py-2 pr-4 text-right font-normal" scope="col">
              스펙
            </th>
            <th className="py-2 text-left font-normal" scope="col">
              무엇을 검증하는가
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr className="border-b border-rule" key={r.tier}>
              <th className="py-2 pr-4 text-left font-normal text-ink" scope="row">
                {r.tier}
              </th>
              <td className="py-2 pr-4 text-right text-ink">
                {r.reading.value}
              </td>
              <td className="py-2 text-ink-2">{r.verifies}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 font-mono text-note leading-5 text-ink-3">
        {devices.label} {devices.value} · {devices.denominator.label}
      </p>
    </div>
  );
}
