import styles from "@/components/candidates/Field.module.css";

/**
 * /c1 — 필드 (FIELD).
 *
 * 447 = `.ts` 249 + `.tsx` 198 (CONTENT.md §2.1, 등급 A). 마크 447개를 격자에
 * 흩뿌려 거리를 두고 보면 텍스처로 읽히게 한다. 그중 236개(도메인 우선 구조
 * 재편, 커밋 91b3363, CONTENT.md §2.5)에 다른 잉크 농도를 준다 — 다만 캡션은
 * "236 / 447"이라고 쓰지 않는다. 원장이 그 포함 관계를 보증하지 않기 때문이다.
 *
 * 필드 자체는 장식이 아니라 마크 하나하나가 leaf 텍스트 요소다 — 이 저장소의
 * 잉크 측정 스크립트(scripts/capture-candidates.mjs)가 텍스트를 가진 leaf
 * 요소와 그래픽 태그만 잉크로 세기 때문에, 배경색만 칠한 빈 div 는 측정에서
 * 보이지 않는다. 시각적 마크와 측정 가능한 마크를 같은 요소로 만든다.
 *
 * 숫자가 섞인 문구는 JSX 텍스트 노드가 아니라 표현식으로 넘긴다 —
 * `eslint.config.mjs` 의 `no-restricted-syntax` 가 `JSXText` 안의 숫자를 막는다
 * (ART_DIRECTION.md 2절, MeasurementBar.tsx 가 이미 쓰는 패턴과 같다).
 *
 * 모션 없음: 이 세 후보는 구조 비교용 정적 프레임이다. Motion 진입을 한 번
 * 시도했으나(로드 1회, 축소 모션 인지) 실측 결과 `networkidle` 대기 자체가
 * 약 700ms 걸려 스크린샷 시점에는 이미 진입이 끝나 있었다 — 지속 시간을
 * MOTION_LANGUAGE.md §4 의 상한(900ms) 안에서 아무리 조정해도 캡처 시점과
 * 경쟁해 이길 수 없었다. 안 보이는 모션을 위해 파일을 늘리는 대신 뺐다.
 */
const TOTAL = 447;
const RESTRUCTURED = 236;
const HEADLINE =
  "6인 팀의 프론트엔드를 혼자 맡아 실시간 멀티플레이 게임 플랫폼을 완성했다.";
const CAPTION_TOTAL = ".ts 249 + .tsx 198 · 2026-08-13 실측";
const CAPTION_RESTRUCTURED = "236파일 재편 · 커밋 91b3363";

export function Field() {
  const marks = Array.from({ length: TOTAL }, (_, i) => i < RESTRUCTURED);

  return (
    <main className={styles.stage} id="main">
      <div aria-hidden="true" className={styles.field}>
        {marks.map((restructured, i) => (
          <span
            className={
              restructured
                ? `${styles.mark} ${styles.markRestructured}`
                : styles.mark
            }
            key={i}
          >
            ■
          </span>
        ))}
      </div>

      <div className={styles.type}>
        <h1 className={styles.headline}>{HEADLINE}</h1>
        <p className={styles.numeral}>{TOTAL}</p>
        <p className={styles.captions}>
          <span>{CAPTION_TOTAL}</span>
          <span>{CAPTION_RESTRUCTURED}</span>
        </p>
      </div>
    </main>
  );
}
