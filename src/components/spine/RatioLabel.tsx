/**
 * 이음선 비율 라벨. 지면에서 가장 큰 글자입니다 (ART_DIRECTION.md 3.4).
 *
 * 인코딩은 하나뿐입니다: 콜론을 포함한 등폭 문자열(`1 : 5` 또는 `0%`/`100%`).
 * 진행 바나 분할 숫자를 겹쳐 만들지 않습니다 — GOLDEN_FIX 1 이 잡은 실측 결함
 * (같은 값을 세 번 인코딩)의 재발 방지입니다.
 *
 * 급수는 이산 브레이크포인트 계단입니다 (`clamp()` 금지, DESIGN_SYSTEM.md 4절):
 * 기본 40px, `≥768px` 96px. `edge`(0%·100% 절)는 그 절만 받는 전폭 슬롯이므로
 * `≥768px` 에서 176px 까지 오릅니다. `computeSpine()` 이 이미 "0%"/"100%" 문자열을
 * 만들므로 여기서는 급수만 담당합니다.
 */
export function RatioLabel({
  label,
  edge,
}: {
  label: string;
  /** 0%·100% 절인가 — 전폭 슬롯 급수를 받습니다. */
  edge: boolean;
}) {
  return (
    <p className="sp-ratio-label" data-edge={edge ? "" : undefined}>
      {label}
    </p>
  );
}
