/**
 * `/projects/yorr` 전용 정적 SVG 다이어그램 3개.
 *
 * 전부 구조를 보여줄 뿐 아무것도 작동시키지 않는다 — CLAUDE.md 의 실패 모드 2
 * ("기계장치 렌더링")를 다시 만들지 않기 위해 클릭 · 재생 · 상태 전이가 없다.
 * 색은 DESIGN_SYSTEM.md 토큰만 쓰고, 모서리는 각지게 두었다(둥근 모서리는
 * 코드 블록에만 허용된다). 애니메이션이 전혀 없으므로 motion-ownership 허용
 * 목록을 건드리지 않는다.
 *
 * 텍스트 라벨을 컴포넌트 바깥의 문자열 상수로 뺀 이유: `eslint.config.mjs` 의
 * `no-restricted-syntax` 규칙이 `.tsx` 안의 JSX 텍스트 노드에 숫자가 있으면
 * 막는다(ART_DIRECTION.md 2절 게이트). `<text>7개 폴더</text>` 처럼 SVG 안에
 * 직접 쓰면 그 규칙에 걸리므로, 상수로 두고 `{}` 로 넣는다.
 *
 * `sub` 를 줄 배열로 받는 이유: SVG `<text>` 는 자동 줄바꿈을 하지 않는다.
 * 첫 실측 캡처(review/projects/yorr)에서 한 줄짜리 부제가 상자 폭과 viewBox
 * 를 넘어 잘려 나갔다 — 폭을 추측으로 늘리는 대신 긴 부제를 직접 두 줄로 쪼갠다.
 *
 * `width`·`height` 를 viewBox 와 같은 값으로 고정한 이유: 지정하지 않으면 SVG 가
 * 컨테이너 폭에 맞춰 줄어들고, 320px 실측 캡처에서 라벨이 판독 불가능한 크기로
 * 찌그러졌다. 고정 픽셀 크기를 주고 호출부에서 `.scroll-x` 로 감싸서, 좁은 화면에서는
 * 줄어드는 대신 그 다이어그램 안에서만 가로 스크롤한다(DESIGN_SYSTEM.md 5절).
 */

const RESTRUCTURE_BEFORE_LABEL = "게임 하나 = 폴더 7개";
const RESTRUCTURE_AFTER_LABEL = "게임 하나 = 폴더 1개(yacht/)";

const STROKE = "var(--rule)";
const INK = "var(--ink)";
const INK_2 = "var(--ink-2)";
const INK_3 = "var(--ink-3)";
const FONT = "var(--font-mono), monospace";

function Node({
  x,
  y,
  w,
  h,
  label,
  sub,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: readonly string[];
}) {
  const lines = sub ?? [];
  const labelY = lines.length > 0 ? y + h / 2 - 6 : y + h / 2 + 4;
  return (
    <g>
      <rect fill="none" height={h} stroke={STROKE} strokeWidth={1} width={w} x={x} y={y} />
      <text fill={INK} fontFamily={FONT} fontSize={13} textAnchor="middle" x={x + w / 2} y={labelY}>
        {label}
      </text>
      {lines.map((line, i) => (
        <text
          fill={INK_3}
          fontFamily={FONT}
          fontSize={11}
          key={line}
          textAnchor="middle"
          x={x + w / 2}
          y={labelY + 16 + i * 14}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <g>
      <line stroke={STROKE} strokeWidth={1} x1={x1} x2={x2} y1={y1} y2={y2} />
      <polygon fill={STROKE} points={`${x2},${y2} ${x2 - 6},${y2 - 4} ${x2 - 6},${y2 + 4}`} />
    </g>
  );
}

/**
 * §2.2 세 원칙을 하나의 흐름으로 보여준다: 센서값 → 판정된 이벤트(원칙 2) →
 * 서버가 권위를 갖는 상태(원칙 1) → 클라이언트 연출(원칙 3).
 */
export function PrinciplesDiagram() {
  return (
    <svg
      aria-label="센서값이 판정된 이벤트로 바뀌어 서버로 가고, 서버가 권위를 가진 상태를 클라이언트가 연출로 그리는 흐름도"
      height={130}
      role="img"
      viewBox="0 0 820 130"
      width={820}
    >
      <Node h={72} label="센서값" sub={["원시 입력"]} w={150} x={0} y={20} />
      <Arrow x1={150} x2={200} y1={56} y2={56} />
      <Node h={72} label="판정된 이벤트" sub={["클라이언트가", "먼저 판정"]} w={190} x={200} y={20} />
      <Arrow x1={390} x2={440} y1={56} y2={56} />
      <Node h={72} label="서버 상태" sub={["최종 권위"]} w={150} x={440} y={20} />
      <Arrow x1={590} x2={640} y1={56} y2={56} />
      <Node h={72} label="클라이언트 연출" sub={["3D · 진동 · 소리", "로컬"]} w={180} x={640} y={20} />
    </svg>
  );
}

/**
 * §2.5 재편. 폭이 아니라 '몇 개의 상자를 넘나드는가'로만 구조를 보여준다 —
 * 근거 문서에 개별 폴더 이름이 없으므로 지어내지 않는다.
 */
export function RestructureDiagram() {
  const scattered = Array.from({ length: 7 }, (_, i) => i);
  return (
    <svg
      aria-label="레이어 우선 구조에서는 게임 하나가 흩어진 상자 일곱 개에 걸쳐 있고, 도메인 우선 구조에서는 상자 하나 안에 모여 있는 비교도"
      height={190}
      role="img"
      viewBox="0 0 720 190"
      width={720}
    >
      <text fill={INK_2} fontFamily={FONT} fontSize={12} x={0} y={16}>
        레이어 우선
      </text>
      {scattered.map((i) => {
        const cols = 4;
        const col = i % cols;
        const row = Math.floor(i / cols);
        return (
          <rect
            fill="none"
            height={28}
            key={i}
            stroke={STROKE}
            strokeWidth={1}
            width={64}
            x={col * 76}
            y={32 + row * 40}
          />
        );
      })}
      <text fill={INK_3} fontFamily={FONT} fontSize={11} x={0} y={162}>
        {RESTRUCTURE_BEFORE_LABEL}
      </text>

      <line stroke={STROKE} strokeDasharray="2 4" strokeWidth={1} x1={330} x2={330} y1={0} y2={190} />

      <text fill={INK_2} fontFamily={FONT} fontSize={12} x={392} y={16}>
        도메인 우선
      </text>
      <Node h={96} label="yacht/" sub={["화면 · 로직 · 렌더링이", "한 폴더 안에"]} w={280} x={392} y={32} />
      <text fill={INK_3} fontFamily={FONT} fontSize={11} x={392} y={162}>
        {RESTRUCTURE_AFTER_LABEL}
      </text>
    </svg>
  );
}

/**
 * §2.4 두 하네스. 프로덕션 빌드에서 MSW 가 빠지는 지점을 가운데 여백으로 보여주고,
 * `contract.ts` 를 둘을 잇는 유일한 다리로 그린다.
 */
export function E2EDiagram() {
  return (
    <svg
      aria-label="소스 코드를 검증하는 Vitest·MSW 하네스와 프로덕션 빌드를 검증하는 Playwright 페이크 하네스가 같은 contract.ts 를 참조하는 다이어그램"
      height={160}
      role="img"
      viewBox="0 0 780 160"
      width={780}
    >
      <Node h={80} label="소스 코드" sub={["Vitest + MSW"]} w={240} x={0} y={0} />
      <Node h={80} label="프로덕션 빌드" sub={["Playwright 라우트 페이크", "(MSW 컴파일 아웃)"]} w={280} x={500} y={0} />
      <Arrow x1={240} x2={314} y1={40} y2={82} />
      <Arrow x1={500} x2={426} y1={40} y2={82} />
      <rect
        fill="none"
        height={38}
        stroke={STROKE}
        strokeDasharray="2 3"
        strokeWidth={1}
        width={150}
        x={295}
        y={102}
      />
      <text fill={INK} fontFamily={FONT} fontSize={12} textAnchor="middle" x={370} y={125}>
        contract.ts
      </text>
    </svg>
  );
}
