import { Fragment } from "react";
import { Enter } from "@/components/candidates/Enter";
import styles from "@/components/candidates/Instrument.module.css";

/**
 * /c2 — 기계 (INSTRUMENT).
 *
 * 소재: 커버리지 래칫(CONTENT.md §2.3, 등급 A). 하한 branches 91, 같은 테스트를
 * 두 번 돌려 90.48% 와 91.43% 를 얻었고, `World.ts` 는 71.71~84.84% 로 흔들린다.
 * 이 게이트는 로컬이다 — "CI 가 강제한다"는 쓰지 않는다
 * (CONTENT.md §9 항목 12, `src/forbidden-claims.test.ts` 가 기계로 막는다).
 *
 * 이 프로토타입은 정적인 "이후" 상태 한 프레임이다. 91.43 이 지금 값이고
 * 90.48 은 계기판 읽기값 안에 이전 값으로만 등장한다 — 애니메이션으로 두 값을
 * 오가지 않는다.
 *
 * 숫자가 섞인 문구는 JSX 텍스트가 아니라 표현식으로 넘긴다(`eslint.config.mjs`
 * 의 `no-restricted-syntax`, Field.tsx 상단 설명 참고).
 */
const NUMERAL = "91.43";
const HEADLINE_LINES = [
  "브랜치 커버리지 하한은 91%다.",
  "같은 테스트를 두 번 돌리면 넘거나, 넘지 못한다.",
] as const;
const READOUT_LINES = [
  "하한 branches 91 · 로컬 게이트",
  "같은 테스트 2회 실행: 90.48 → 91.43",
  "World.ts branches 71.71 ~ 84.84",
  "측정에서만 제외 · 테스트 48개는 그대로 실행",
] as const;

export function Instrument() {
  return (
    <main className={styles.stage} id="main">
      <p className={styles.label}>로컬 게이트</p>

      <div aria-hidden="true" className={styles.plane} />
      <div aria-hidden="true" className={styles.gate} />
      <div aria-hidden="true" className={styles.gateMarker} />

      <Enter as="h1" className={styles.headline}>
        {HEADLINE_LINES.map((line, i) => (
          <Fragment key={line}>
            {i > 0 ? <br /> : null}
            {line}
          </Fragment>
        ))}
      </Enter>

      <Enter as="p" className={styles.numeral}>
        {NUMERAL}
      </Enter>

      <Enter as="p" className={styles.verdict} delayMs={60}>
        통과
      </Enter>

      <p className={styles.readout}>
        {READOUT_LINES.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
    </main>
  );
}
