import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { EvidenceNote, type Citation, type EvidenceLink } from "@/components/EvidenceNote";
import { PROJECTS } from "@/components/showcase/shots";
import { BannerFrame } from "@/components/showcase/yorr/BannerFrame";
import { E2EDiagram, PrinciplesDiagram, RestructureDiagram } from "@/components/showcase/yorr/Diagrams";
import { Footer } from "@/components/showcase/landing/Footer";
import type { Grade } from "@/lib/reading";
import {
  coverage,
  coverageLinks,
  e2e,
  e2eLinks,
  limits,
  limitsLinks,
  overview,
  overviewLinks,
  principles,
  principlesLinks,
  restructure,
  restructureLinks,
  rollback,
  rollbackLinks,
  type Claim,
} from "@/content/yorr";

function requireProject(id: string) {
  const found = PROJECTS.find((p) => p.id === id);
  if (!found) throw new Error(`shots.ts 에 ${id} 항목이 없다`);
  return found;
}

const project = requireProject("yorr");

export const metadata: Metadata = {
  title: "YORR — 아키텍처 · 코드 리딩",
  description: project.blurb,
};

/*
  이 페이지의 근거 표시 방침 (redesign, 이전 판 반려 사유: CLAUDE.md 등록의
  "facts with evidence grades as footnotes" 그 자체).

  이전 판은 주장마다 회색 각주 한 줄(`{source} · 등급 {grade}`)을 바로 아래 박아
  절 전체가 문서로 읽혔다 — 실측 약 서른 줄. 이 페이지의 주장은 전부 등급 A
  하나뿐이므로(`ref/` 등급 체계), 절마다 그 사실을 한 번만 말하고(EvidenceNote 의
  "등급 A"), 개별 주장이 정확히 어느 문장을 근거하는지는 절 끝 `<details>`
  ("근거 보기") 안에 모은다. 펼치지 않아도 등급은 이미 선언돼 있고, 펼치면 문장
  단위까지 내려간다 — 근거가 사라지는 게 아니라 표면에서 접혀 있을 뿐이다.
*/
function citation(label: string, claim: Claim): Citation {
  return { label, source: claim.source, grade: claim.grade };
}

/** 절 하나 = 제목 + 근거 블록(오른쪽, 좁은 화면에서는 아래) + 본문. */
function Section({
  id,
  title,
  grade,
  links,
  citations,
  children,
}: {
  id: string;
  title: string;
  grade: Grade;
  links: readonly EvidenceLink[];
  citations?: readonly Citation[];
  children: ReactNode;
}) {
  return (
    <section className="mt-20 border-t border-rule pt-14 first:mt-14" id={id}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
        <h2 className="text-decision font-semibold text-ink">{title}</h2>
        <EvidenceNote citations={citations} grade={grade} gradeLabel="등급" links={links} />
      </div>
      <div className="mt-7 flex flex-col gap-7">{children}</div>
    </section>
  );
}

/** 본문 문단. 읽기 폭(34rem)을 여기서 고정한다 — 절 컨테이너는 넓게 두고 문단만 좁힌다. */
function P({ claim }: { claim: Claim }) {
  return <p className="max-w-[var(--spacing-measure)] text-ink-2">{claim.text}</p>;
}

/** 절 안에서 산문과 나란히 두는 다이어그램 트랙. 데스크톱은 나란히, 좁은 화면은 아래로. */
function WithVisual({ visual, children }: { visual: ReactNode; children: ReactNode }) {
  /*
    `grid-cols-1` 이 아니라 `grid` 만 두면(암묵적 단일 auto 트랙) 그 트랙이 자식의
    min-content 폭(SVG 다이어그램의 실제 폭, 최대 820px)까지 자라 320px 에서 문서
    전체가 가로로 넘쳤다(실측 840px). `minmax(0, 1fr)` 트랙만 자식을 컨테이너 폭으로
    죄고, 넘치는 내용은 `.scroll-x` 가 트랙 안에서만 스크롤한다.
  */
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,var(--spacing-measure))_minmax(0,1fr)] lg:items-start">
      <div className="flex min-w-0 flex-col gap-7">{children}</div>
      <div className="flex min-w-0 flex-col gap-4">{visual}</div>
    </div>
  );
}

function BackLink() {
  return (
    <p className="font-mono text-mono">
      <Link href="/">← 처음으로</Link>
    </p>
  );
}

/*
  `/projects/yorr` — 랜딩이 보여준 것을 여기서 설명한다(CLAUDE.md 「What the owner
  actually wants」 · docs/portfolio/SCENE_GRAPH.md 2절). 랜딩과 달리 이 페이지는
  산문이 허용된다 — 클릭해서 들어온 독자는 깊이를 원한다.

  redesign 사유(이 파일 상단 커밋 참고): 이전 판은 944px 밴드 안에 544px 측정폭을
  중앙 정렬한 것이었고(1920 첫 뷰포트 빈 띠 50%), 왼쪽 위에 똑같은 74×155 빈 액자
  두 장, 그 옆에 1270px 의 빈 공간이 있었다. 지금 판은 (1) 헤더 바로 아래 전폭
  액자 하나로 랜딩의 회랑과 이어 붙이고, (2) 절 컨테이너를 넓혀 다이어그램·표를
  본문 옆 트랙에 놓고, (3) 문장마다 반복되던 회색 등급 각주를 절당 하나의 접힘
  으로 모았다.

  모션 소유권: 이 페이지에는 애니메이션이 없다(정적 SVG 다이어그램 3개, `<details>`
  는 네이티브 토글이라 전이가 없다). `motion/react` 를 쓰지 않으므로
  motion-ownership 허용 목록을 건드리지 않는다.

  숫자 게이트: 화면에 나가는 모든 수치는 `src/content/yorr.ts` 의 값을 `{}` 로
  꺼내 쓴다. JSX 텍스트 노드에 숫자를 직접 쓰지 않는다(eslint.config.mjs 의
  no-restricted-syntax, ART_DIRECTION.md 2절 게이트).
*/
export default function YorrProjectPage() {
  const overviewFacts = Object.values(overview);
  const overviewCitations: readonly Citation[] = overviewFacts.map((f) => ({
    label: f.label,
    source: f.source,
    grade: f.grade,
  }));

  const principlesCitations: readonly Citation[] = principles.map((p) =>
    citation(p.title, { text: p.body, source: p.source, grade: p.grade }),
  );

  const coverageCitations: readonly Citation[] = [
    citation("하한 출처", coverage.floorSource),
    citation("분모 설계", coverage.denominator),
    citation("흔들림 원인", coverage.oscillation),
    citation("흔들림 식별", coverage.identification),
    citation("기각한 대안", coverage.rejectedAlternative),
    citation("선택한 조치", coverage.decision),
    citation("유예한 해결", coverage.deferred),
    citation("로컬 게이트", coverage.localGate),
  ];

  const e2eCitations: readonly Citation[] = [
    citation("규모", e2e.scale),
    citation("두 벌인 이유", e2e.whyTwo),
    citation("계약", e2e.contract),
    citation("실행 대상", e2e.projects),
    citation("좁은 폭 판정", e2e.narrowWidth),
  ];

  const restructureCitations: readonly Citation[] = [
    citation("규모", restructure.scale),
    citation("이전 구조", restructure.before),
    citation("이후 구조", restructure.after),
    citation("기계 검사", restructure.machineCheck),
    citation("로컬 게이트", restructure.localGate),
  ];

  const rollbackCitations: readonly Citation[] = [citation("롤백 판단", rollback)];

  const limitsCitations: readonly Citation[] = [
    citation("기간", limits[0]),
    citation("백엔드 분담", limits[1]),
    citation("AI 트레일러", limits[2]),
    citation("커버리지 분모", limits[3]),
    citation("공개 저장소", limits[4]),
  ];

  return (
    <main id="main">
      <div className="mx-auto max-w-[1680px] px-5 pt-7 md:px-10 md:pt-10 lg:px-14">
        <BackLink />

        <header className="mt-7">
          <h1 className="text-[32px] font-semibold leading-tight text-ink md:text-[44px] lg:text-[56px]">
            {project.name}
          </h1>
          <p className="mt-4 max-w-[var(--spacing-measure)] text-ink-2">{project.blurb}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.keywords.map((keyword) => (
              <li
                className="border border-rule px-[10px] py-1 font-mono text-mono text-ink-2"
                key={keyword}
              >
                {keyword}
              </li>
            ))}
          </ul>
        </header>
      </div>

      {/*
        랜딩과의 연속성 — 회랑에서 보던 액자 언어(PlaceholderFrame) 그대로, 이번엔
        한 장을 전폭으로 편다. 컨테이너 밖(전폭)에 두어 첫 뷰포트가 중앙 컬럼 하나로
        쪼그라들지 않게 한다.
      */}
      <div className="mt-10">
        <BannerFrame desktopShot={project.shots[3]} mobileShot={project.shots[0]} />
      </div>

      <div className="mx-auto max-w-[1680px] px-5 pb-14 md:px-10 lg:px-14">
        <Section citations={overviewCitations} grade="A" id="overview" links={overviewLinks} title="개요">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {overviewFacts.map((fact) => (
              <div className="border border-rule p-4" key={fact.label}>
                <dt className="font-mono text-note text-ink-3">{fact.label}</dt>
                <dd className="mt-1 text-ink-2">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section citations={principlesCitations} grade="A" id="principles" links={principlesLinks} title="세 가지 설계 판단">
          <WithVisual
            visual={
              <div className="scroll-x">
                <PrinciplesDiagram />
              </div>
            }
          >
            <p className="max-w-[var(--spacing-measure)] text-ink-2">
              본인이 쓴 <span className="font-mono text-mono">frontend/docs/architecture.md</span>
              에 남긴 세 원칙이다. 화면 하나를 그리기까지 이 순서로 통과한다.
            </p>
            <div className="flex flex-col gap-4">
              {principles.map((principle) => (
                <div key={principle.id}>
                  <h3 className="font-semibold text-ink">{principle.title}</h3>
                  <p className="mt-1 text-ink-2">{principle.body}</p>
                </div>
              ))}
            </div>
          </WithVisual>
        </Section>

        <Section citations={coverageCitations} grade="A" id="coverage" links={coverageLinks} title="커버리지 래칫">
          <p className="max-w-[var(--spacing-measure)] text-ink-2">
            <span className="font-mono text-mono">frontend/vitest.config.ts</span>
            에 건 하한이다. 통과 여부가 아니라{" "}
            <em>왜 이 숫자로 정했고 어디서 흔들리는지</em>가 이 절의 요점이다.
          </p>

          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {coverage.floors.map((row) => (
              <div className="border border-rule p-4" key={row.metric}>
                <dt className="font-mono text-note text-ink-3">{row.metric}</dt>
                <dd className="mt-2 flex items-baseline gap-2 font-mono text-mono">
                  <span className="text-ink">{row.measured}%</span>
                  <span className="text-ink-3">/ {row.floor}% 하한</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="grid grid-cols-1 gap-x-10 gap-y-7 lg:grid-cols-2">
            <P claim={coverage.denominator} />
            <P claim={coverage.oscillation} />
            <P claim={coverage.identification} />
            <P claim={coverage.rejectedAlternative} />
            <P claim={coverage.decision} />
            <P claim={coverage.deferred} />
          </div>

          <div className="max-w-[var(--spacing-measure)] border border-rule px-4 py-4">
            <p className="text-ink-2">{coverage.localGate.text}</p>
          </div>
        </Section>

        <Section citations={e2eCitations} grade="A" id="e2e" links={e2eLinks} title="E2E 두 벌">
          <WithVisual
            visual={
              <div className="scroll-x">
                <E2EDiagram />
              </div>
            }
          >
            <P claim={e2e.scale} />
            <P claim={e2e.whyTwo} />
          </WithVisual>
          <div className="grid grid-cols-1 gap-x-10 gap-y-7 lg:grid-cols-3">
            <P claim={e2e.contract} />
            <P claim={e2e.projects} />
            <P claim={e2e.narrowWidth} />
          </div>
        </Section>

        <Section citations={restructureCitations} grade="A" id="restructure" links={restructureLinks} title="도메인 우선 구조 재편">
          <WithVisual
            visual={
              <div className="scroll-x">
                <RestructureDiagram />
              </div>
            }
          >
            <P claim={restructure.scale} />
            <P claim={restructure.before} />
            <P claim={restructure.after} />
          </WithVisual>
          <div className="grid grid-cols-1 gap-x-10 gap-y-7 lg:grid-cols-2">
            <P claim={restructure.machineCheck} />
            <div className="max-w-[var(--spacing-measure)] border border-rule px-4 py-4">
              <p className="text-ink-2">{restructure.localGate.text}</p>
            </div>
          </div>
          <p className="font-mono text-note text-ink-3">{restructure.commit}</p>
        </Section>

        <Section citations={rollbackCitations} grade="A" id="rollback" links={rollbackLinks} title="롤백 판단">
          <P claim={rollback} />
        </Section>

        <Section citations={limitsCitations} grade="A" id="limits" links={limitsLinks} title="한계">
          <p className="max-w-[var(--spacing-measure)] text-ink-2">
            과장하지 않는다. 아래는 각주가 아니라 위 절들과 같은 무게로 읽는 사실이다.
          </p>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {limits.map((limit) => (
              <li className="border border-rule p-4" key={limit.text}>
                <p className="text-ink-2">{limit.text}</p>
              </li>
            ))}
          </ul>
        </Section>

        <div className="mt-14 border-t border-rule pt-7">
          <BackLink />
        </div>
      </div>

      <div className="mt-14">
        <Footer />
      </div>
    </main>
  );
}
