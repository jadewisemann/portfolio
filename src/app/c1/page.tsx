import { Field } from "@/components/candidates/Field";

/**
 * /c1 — 필드 (FIELD). STRUCTURAL_BRANCH 후보. 첫 뷰포트 하나만 렌더한다.
 * 프로덕션 씬이 아니다 — `docs/portfolio/` 스펙과 `scripts/capture-candidates.mjs`
 * 가 요구하는 3안 비교용 스로우어웨이 빌드다.
 */
export default function C1Page() {
  return <Field />;
}
