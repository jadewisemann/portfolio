import styles from "./Circuit.module.css";
import { bp1440, bp1920, bp320, grainYs, type Breakpoint } from "./circuit-data";

const NAME = "jadewisemann";

/**
 * 한 뷰포트분의 회로를 그린다. 안/바깥을 톤이 아니라 결(1px 대 2px 획)로
 * 가른다 — DESIGN_SYSTEM.md 2절("깊이는 잉크 농도와 선 두께로")과 이 후보의
 * 핵심 주장이 같다. 클립은 두 개다: `inside` 는 다각형 그 자체, `outside` 는
 * 뷰포트 사각형과 다각형을 evenodd 로 합쳐 다각형을 파낸 나머지다.
 */
function CircuitSvg({ bp, id }: { bp: Breakpoint; id: string }) {
  const ys = grainYs(bp.height);
  const insideId = `d2-inside-${id}`;
  const outsideId = `d2-outside-${id}`;

  return (
    <svg
      aria-hidden="true"
      className={styles.circuit}
      data-bp={id}
      height={bp.height}
      viewBox={`0 0 ${bp.width} ${bp.height}`}
      width={bp.width}
    >
      <defs>
        <clipPath id={insideId}>
          <path d={bp.insidePath} />
        </clipPath>
        <clipPath id={outsideId}>
          <path
            clipRule="evenodd"
            d={`M0,0 H${bp.width} V${bp.height} H0 Z ${bp.insidePath}`}
          />
        </clipPath>
      </defs>

      {/*
        28px 리듬 기판. 안쪽 1px, 바깥쪽 2px — 같은 색, 같은 피치, 같은 위상.

        정수 좌표에 그린 1px 획은 SVG 래스터라이저가 픽셀 경계에 걸쳐 반투명
        두 줄로 안티에일리어싱한다 — 실측(캔버스 재판독)으로 확인했다. 그러면
        1px 대 2px 대비가 "선명한 한 줄 대 두 줄"이 아니라 "흐린 두 줄 대
        진한 두 줄"로 죽는다. 홀수 폭(1px)만 0.5px 내려 픽셀 격자에 맞춘다 —
        짝수 폭(2px)은 정수 좌표에서 이미 온전한 두 행을 덮는다.
      */}
      <g clipPath={`url(#${outsideId})`}>
        {ys.map((y) => (
          <line
            className={styles.grainOutside}
            key={y}
            x1={0}
            x2={bp.width}
            y1={y}
            y2={y}
          />
        ))}
      </g>
      <g clipPath={`url(#${insideId})`}>
        {ys.map((y) => (
          <line
            className={styles.grainInside}
            key={y}
            x1={0}
            x2={bp.width}
            y1={y + 0.5}
            y2={y + 0.5}
          />
        ))}
      </g>

      {/* 회로 자체. 히트 밴드(44px, 투명)와 보이는 획(1px→2px)을 한 그룹에 둔다. */}
      <g className={styles.pathGroup}>
        <path className={styles.hitband} d={bp.hitPath} />
        <path className={styles.pathVisible} d={bp.strokePath} />
      </g>
    </svg>
  );
}

/**
 * /d2 — 닫힌 회로. 첫 뷰포트 전용, 정적 렌더(마커 주행은 다음 단계).
 * 화면의 글자는 이름 하나뿐이고, 그 이름은 항상 회로 안쪽에 있다 —
 * 안쪽에 놓이는 유일한 잉크라는 스펙 규칙을 그대로 지킨다.
 */
export function Circuit() {
  return (
    <main className={styles.stage} id="main">
      <CircuitSvg bp={bp1920} id="1920" />
      <CircuitSvg bp={bp1440} id="1440" />
      <CircuitSvg bp={bp320} id="320" />

      {/* 좌표는 Circuit.module.css `.name` 의 세 미디어 쿼리 블록에 있고
          circuit-data.ts 의 Breakpoint.name 과 같은 값이다(문서화용 중복). */}
      <p className={styles.name}>{NAME}</p>
    </main>
  );
}
