import styles from "./Field.module.css";

/**
 * 배경장 — 입자 낀 빛 웅덩이 셋이 떠다니며, 가까워지면 **끈적하게 붙는다**.
 *
 * 참조는 aarab.me 의 첫 화면이다 (소유자 지시, 2026-09-03). 붙는 효과는 소유자가 방식까지
 * 지정했다 (09-04): "블러 → 콘트라스트 → 다시 블러". 고전적인 goo 필터다:
 *
 *   1. feGaussianBlur   덩어리의 알파를 넓게 퍼뜨린다. 두 덩어리 사이의 빈 공간에 얕은
 *                       알파가 생긴다.
 *   2. feColorMatrix    알파에 기울기(×7)와 음수 절편(−2)을 곱한다. 얕은 알파는 0으로,
 *                       중간 이상은 1로 — 두 덩어리 사이의 다리가 하나의 면이 된다.
 *                       ×18 −7 (교과서 값)은 가장자리가 원판처럼 딱딱해져 참조의 넓은
 *                       빛무리가 사라졌다 (09-04 실측). 기울기를 낮춰 붙되 번지게 한다.
 *   3. feGaussianBlur   2에서 생긴 경계를 다시 넓게 풀어 빛무리로 되돌린다.
 *
 * 입자는 필터 체인 밖이다 — 정적 타일 하나를 `overlay` 로 덮는다 (`Field.module.css`).
 * 필터 안에 `feTurbulence` 를 넣으면 매 프레임 입자를 다시 계산한다.
 *
 * **비용.** 1차 판(09-03)이 느렸던 이유는 필터를 뷰포트 크기의 층에 매 프레임 걸었기
 * 때문이다. 지금은 `.stage` 를 **뷰포트의 4분의 1 크기로 그려 4배 확대**한다 — 필터
 * 래스터는 픽셀 수에 비례하므로 16분의 1이 된다 (1920×1080 에서 480×270). 블러 반경도
 * 그만큼 작게 적었다(확대되며 4배가 된다). 덩어리는 어차피 흐린 물체라 해상도 손실이
 * 보이지 않는다.
 *
 * MOTION_LANGUAGE.md 2절(스스로 시작하는 애니메이션) · 7절(블러)의 예외다 — 조건은 그 절에.
 */
export function Field() {
  return (
    <div className={styles.field} aria-hidden="true">
      <svg className={styles.defs} width="0" height="0" focusable="false">
        <filter
          id="field-goo"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 7 -2"
            result="goo"
          />
          <feGaussianBlur in="goo" stdDeviation="11" />
        </filter>
      </svg>

      <div className={styles.stage}>
        <span className={`${styles.blob} ${styles.a}`} />
        <span className={`${styles.blob} ${styles.b}`} />
        <span className={`${styles.blob} ${styles.c}`} />
      </div>
      <span className={styles.grain} />
    </div>
  );
}
