import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { EvidenceNote, type EvidenceLink } from "@/components/EvidenceNote";
import { PlaceholderFrame } from "@/components/showcase/PlaceholderFrame";
import { PROJECTS } from "@/components/showcase/shots";
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
  type Fact,
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

/** 주장 하나 + 그 오른쪽(모바일은 아래)의 등급·출처. ART_DIRECTION.md 3.15·3.16. */
function Cite({ source, grade }: { source: string; grade: string }) {
  return (
    <p className="mt-1 font-mono text-note text-ink-3">
      {source} · 등급 {grade}
    </p>
  );
}

function FactRow({ fact }: { fact: Fact }) {
  return (
    <div className="border-t border-rule py-4 first:border-t-0 first:pt-0">
      <dt className="font-mono text-note text-ink-3">{fact.label}</dt>
      <dd className="mt-1 text-ink-2">{fact.value}</dd>
      <Cite grade={fact.grade} source={fact.source} />
    </div>
  );
}

function P({ claim }: { claim: Claim }) {
  return (
    <div>
      <p className="text-ink-2">{claim.text}</p>
      <Cite grade={claim.grade} source={claim.source} />
    </div>
  );
}

/**
 * 절 하나 = 제목 + (본문 측정폭 안의 산문 · 표 · 다이어그램) + 오른쪽(모바일은 아래) 근거.
 * 위쪽 괘선과 28px 배수 여백으로 절을 가른다 — 제목만으로 절을 가르지 않는다
 * (긴 글 페이지에서 "제목이 절을 가르지 못한다"는 결함을 막기 위해서다).
 */
function Section({
  id,
  title,
  links,
  grade,
  children,
}: {
  id: string;
  title: string;
  links: readonly EvidenceLink[];
  grade: Grade;
  children: ReactNode;
}) {
  return (
    <section className="mt-14 border-t border-rule pt-14" id={id}>
      <h2 className="text-decision font-semibold text-ink">{title}</h2>
      <div className="mt-7 flex flex-col gap-7 md:flex-row md:items-start md:gap-14">
        <div className="flex max-w-[var(--spacing-measure)] flex-col gap-7">{children}</div>
        <EvidenceNote grade={grade} gradeLabel="등급" links={links} />
      </div>
    </section>
  );
}

/*
  `/projects/yorr` — 랜딩이 보여준 것을 여기서 설명한다(CLAUDE.md 「What the owner
  actually wants」 · docs/portfolio/SCENE_GRAPH.md 2절). 랜딩과 달리 이 페이지는
  산문이 허용된다 — 클릭해서 들어온 독자는 깊이를 원한다.

  모션 소유권: 이 페이지에는 애니메이션이 없다(정적 SVG 다이어그램 3개, 전이 없음).
  `motion/react` 를 쓰지 않으므로 motion-ownership 허용 목록을 건드리지 않는다.

  숫자 게이트: 화면에 나가는 모든 수치는 `src/content/yorr.ts` 의 값을 `{}` 로
  꺼내 쓴다. JSX 텍스트 노드에 숫자를 직접 쓰지 않는다(eslint.config.mjs 의
  no-restricted-syntax, ART_DIRECTION.md 2절 게이트).
*/
export default function YorrProjectPage() {
  return (
    <main id="main">
      <div className="mx-auto max-w-5xl px-5 pt-7 md:px-10 md:pt-14">
        <p className="font-mono text-mono">
          <Link href="/">← 처음으로</Link>
        </p>

        <header className="mt-7">
          <h1 className="text-decision font-semibold text-ink md:text-[40px]">{project.name}</h1>
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

        {/* 랜딩과의 연속성 — 회랑에서 보던 자리표시자 액자 두 장을 그대로 가져온다. */}
        <div className="mt-7 flex flex-wrap gap-4">
          {project.shots.slice(0, 2).map((shot, i) => (
            <PlaceholderFrame className="h-40 w-auto" key={`${project.id}-${i}`} shot={shot} />
          ))}
        </div>

        <Section grade="A" id="overview" links={overviewLinks} title="개요">
          <dl className="flex flex-col">
            {Object.values(overview).map((fact) => (
              <FactRow fact={fact} key={fact.label} />
            ))}
          </dl>
        </Section>

        <Section grade="A" id="principles" links={principlesLinks} title="세 가지 설계 판단">
          <p className="text-ink-2">
            본인이 쓴 <span className="font-mono text-mono">frontend/docs/architecture.md</span>
            에 남긴 세 원칙이다. 화면 하나를 그리기까지 이 순서로 통과한다.
          </p>
          <div className="scroll-x">
            <PrinciplesDiagram />
          </div>
          <div className="flex flex-col gap-4">
            {principles.map((principle) => (
              <div key={principle.id}>
                <h3 className="font-semibold text-ink">{principle.title}</h3>
                <p className="mt-1 text-ink-2">{principle.body}</p>
                <Cite grade={principle.grade} source={principle.source} />
              </div>
            ))}
          </div>
        </Section>

        <Section grade="A" id="coverage" links={coverageLinks} title="커버리지 래칫">
          <p className="text-ink-2">
            <span className="font-mono text-mono">frontend/vitest.config.ts</span>
            에 건 하한이다. 통과 여부가 아니라{" "}
            <em>왜 이 숫자로 정했고 어디서 흔들리는지</em>가 이 절의 요점이다.
          </p>

          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-rule text-ink-3">
                <th className="py-2 font-normal" scope="col">
                  지표
                </th>
                <th className="py-2 font-normal font-mono text-mono" scope="col">
                  하한
                </th>
                <th className="py-2 font-normal font-mono text-mono" scope="col">
                  실측
                </th>
              </tr>
            </thead>
            <tbody>
              {coverage.floors.map((row) => (
                <tr className="border-b border-rule" key={row.metric}>
                  <td className="py-2 font-mono text-mono text-ink-2">{row.metric}</td>
                  <td className="py-2 font-mono text-mono text-ink-2">{row.floor}%</td>
                  <td className="py-2 font-mono text-mono text-ink">{row.measured}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Cite grade={coverage.floorSource.grade} source={coverage.floorSource.source} />

          <P claim={coverage.denominator} />
          <P claim={coverage.oscillation} />
          <P claim={coverage.identification} />
          <P claim={coverage.rejectedAlternative} />
          <P claim={coverage.decision} />
          <P claim={coverage.deferred} />

          <div className="border border-rule px-4 py-4">
            <p className="text-ink-2">{coverage.localGate.text}</p>
            <Cite grade={coverage.localGate.grade} source={coverage.localGate.source} />
          </div>
        </Section>

        <Section grade="A" id="e2e" links={e2eLinks} title="E2E 두 벌">
          <P claim={e2e.scale} />
          <P claim={e2e.whyTwo} />
          <div className="scroll-x">
            <E2EDiagram />
          </div>
          <P claim={e2e.contract} />
          <P claim={e2e.projects} />
          <P claim={e2e.narrowWidth} />
        </Section>

        <Section grade="A" id="restructure" links={restructureLinks} title="도메인 우선 구조 재편">
          <P claim={restructure.scale} />
          <P claim={restructure.before} />
          <div className="scroll-x">
            <RestructureDiagram />
          </div>
          <P claim={restructure.after} />
          <P claim={restructure.machineCheck} />
          <div className="border border-rule px-4 py-4">
            <p className="text-ink-2">{restructure.localGate.text}</p>
            <Cite grade={restructure.localGate.grade} source={restructure.localGate.source} />
          </div>
          <p className="font-mono text-note text-ink-3">{restructure.commit}</p>
        </Section>

        <Section grade="A" id="rollback" links={rollbackLinks} title="롤백 판단">
          <P claim={rollback} />
        </Section>

        <Section grade="A" id="limits" links={limitsLinks} title="한계">
          <p className="text-ink-2">
            과장하지 않는다. 아래는 각주가 아니라 위 절들과 같은 무게로 읽는 사실이다.
          </p>
          <ul className="flex flex-col gap-4">
            {limits.map((limit) => (
              <li className="border-l-2 border-rule pl-4" key={limit.text}>
                <p className="text-ink-2">{limit.text}</p>
                <Cite grade={limit.grade} source={limit.source} />
              </li>
            ))}
          </ul>
        </Section>

        <p className="mt-14 border-t border-rule pt-7 font-mono text-mono">
          <Link href="/">← 처음으로</Link>
        </p>
      </div>

      <div className="mt-14">
        <Footer />
      </div>
    </main>
  );
}
