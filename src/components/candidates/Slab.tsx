import { Lines } from "@/components/candidates/Lines";
import styles from "@/components/candidates/Slab.module.css";

/**
 * /c3 — 슬래브 (SLAB).
 *
 * 글자 자체가 이미지가 되는 급수. 좌우 여백에 시각적으로 맞춘 헤드라인 +
 * 전폭 괘선 + 작동 패널(무한 렌더링 순환, CONTENT.md §3.5, 등급 A).
 *
 * 줄바꿈은 브레이크포인트마다 손으로 끊는다(스펙 요구) — 어절 묶음 자체가
 * 다르므로 같은 마크업을 재사용할 수 없다. 세 벌을 모두 DOM 에 두고 CSS 로
 * 하나만 보이게 한다(`.h320` / `.h1440` / `.h1920`, `.sub1440` / `.sub1920`).
 *
 * 320px 실측 메모: `word-break: keep-all` 을 지키면서 288px 폭 · 48px 급수에
 * 이 문장을 정확히 6줄로 끊을 수 없었다 — 어절 "게임"(2) "플랫폼을"(4)
 * "완성했다"(4) 묶음이 마지막 줄에 몰리면 10자가 되어 폭을 넘는다. 7줄로
 * 끊었다(자세한 내용은 이 작업의 최종 보고 참고).
 *
 * 숫자가 섞인 문구는 JSX 텍스트가 아니라 표현식으로 넘긴다(`eslint.config.mjs`
 * 의 `no-restricted-syntax`, Field.tsx 상단 설명 참고).
 */
const LINES_320 = [
  "6인 팀의",
  "프론트엔드를",
  "혼자 맡아",
  "실시간",
  "멀티플레이",
  "게임 플랫폼을",
  "완성했다.",
];
const LINES_1440 = [
  "6인 팀의 프론트엔드를",
  "혼자 맡아 실시간",
  "멀티플레이 게임",
  "플랫폼을 완성했다.",
];
const LINES_1920 = [
  "6인 팀의 프론트엔드를",
  "혼자 맡아 실시간",
  "멀티플레이",
  "게임 플랫폼을 완성했다.",
];

const SUB_1440 = [
  "리뷰어가 없었으므로,",
  "품질은 리뷰 대신 테스트 · 린트 ·",
  "훅이 지키게 만들었다.",
];
const SUB_1920 = [
  "리뷰어가 없었으므로, 품질은",
  "리뷰 대신 테스트 · 린트 · 훅이 지키게 만들었다.",
];

const CELLS = [
  { label: "getQueryParam · 불안정", unstable: true },
  { label: "안정 함수 1", unstable: false },
  { label: "안정 함수 2", unstable: false },
  { label: "안정 함수 3", unstable: false },
  { label: "안정 함수 4", unstable: false },
];

const CYCLE = "effect → setState → 리렌더 → 새 참조 → effect";
const CAPTION = "[Fix/issue-284] · 786efc5";

export function Slab() {
  return (
    <main className={styles.stage} id="main">
      <h1 className={styles.headline}>
        <span className={styles.h320}>
          <Lines lines={LINES_320} />
        </span>
        <span className={styles.h1440}>
          <Lines lines={LINES_1440} />
        </span>
        <span className={styles.h1920}>
          <Lines lines={LINES_1920} />
        </span>
      </h1>

      <p className={styles.sub}>
        <span className={styles.sub1440}>
          <Lines lines={SUB_1440} />
        </span>
        <span className={styles.sub1920}>
          <Lines lines={SUB_1920} />
        </span>
      </p>

      <div className={styles.rule} />

      <section aria-label="작동 패널" className={styles.panel}>
        <h2 className={styles.panelHeading}>나가는 간선이 없는 순환</h2>
        <div className={styles.cells}>
          {CELLS.map((cell) => (
            <span
              className={
                cell.unstable
                  ? `${styles.cell} ${styles.cellUnstable}`
                  : styles.cell
              }
              key={cell.label}
            >
              {cell.label}
            </span>
          ))}
        </div>
        <p className={styles.cycle}>{CYCLE}</p>
        <p className={styles.caption}>{CAPTION}</p>
      </section>
    </main>
  );
}
