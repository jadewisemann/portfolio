import { Circuit } from "@/components/wordless/Circuit";

/**
 * /d2 — 닫힌 회로 (CIRCUIT WITH NO EXIT). 첫 뷰포트 후보. `docs/portfolio/` 스펙과
 * `scripts/capture-candidates.mjs` 비교용 스로우어웨이 빌드다. `/c1`~`/c3` 를
 * 대체하는 새 방향이며, 화면의 글자는 이름 하나뿐이다.
 */
export default function D2Page() {
  return <Circuit />;
}
