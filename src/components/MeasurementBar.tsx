import type { Reading } from "@/lib/reading";

/**
 * 측정 막대. 서사의 핵심은 막대가 아니라 **하한 눈금의 위치**입니다.
 * 기성 Meter 와 Progress 는 임의 위치에 눈금을 꽂는 옵션을 주지 않아 직접 만듭니다
 * (COMPONENT_REGISTRY.md C3).
 *
 * 모션 소유자: 없음. 정적입니다 (MOTION_LANGUAGE.md 12절).
 *
 * `readings` 가 둘이면 두 실행 비교이고, 그 사이 구간이 흔들림 폭입니다.
 */
export function MeasurementBar({
  readings,
  floor,
  label,
}: {
  readings: readonly Reading[];
  /** 하한 눈금. 없으면 그리지 않습니다 — 추정치를 꽂지 않습니다. */
  floor?: number;
  label: string;
}) {
  const values = readings.map((r) => r.value);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const denominators = readings.map((r) => r.denominator.label).join(" · ");

  // 하한과 실측값의 관계가 읽혀야 하므로 하한 아래로도 여유를 둡니다.
  const min = Math.floor(Math.min(lo, floor ?? lo) - 2);
  const max = 100;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  const valuetext =
    floor === undefined
      ? `${label} ${values.join(", ")}%`
      : `${label} ${values.join(", ")}% (하한 ${floor}%)`;

  return (
    <div className="font-mono text-note leading-5">
      <div className="flex items-baseline justify-between gap-3 text-ink-2">
        <span>{label}</span>
        <span className="text-ink">
          {values.map((v) => `${v}%`).join(" / ")}
        </span>
      </div>

      <div
        aria-label={label}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={hi}
        aria-valuetext={valuetext}
        className="relative mt-1 h-3 border-y border-rule"
        role="meter"
      >
        {/* 실측 구간. 값이 둘이면 그 사이가 흔들림 폭입니다. */}
        <span
          className="absolute inset-y-0 bg-ink-3"
          style={{ left: 0, width: `${pct(lo)}%` }}
        />
        {values.length > 1 ? (
          <span
            className="absolute inset-y-0 bg-ink-3/40"
            style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }}
          />
        ) : null}

        {/* 하한 눈금. 이것의 위치가 서사입니다. */}
        {floor === undefined ? null : (
          <span
            aria-hidden="true"
            className="absolute -top-1 -bottom-1 w-px bg-signal-built"
            style={{ left: `${pct(floor)}%` }}
          />
        )}
      </div>

      <p className="mt-1 text-ink-3">{denominators}</p>
    </div>
  );
}
