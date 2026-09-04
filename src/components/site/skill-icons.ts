import {
  siAxios,
  siCommitlint,
  siEslint,
  siFirebase,
  siGit,
  siGithub,
  siHtml5,
  siJavascript,
  siJest,
  siMarkdown,
  siMockserviceworker,
  siNextdotjs,
  siPython,
  siRadixui,
  siReact,
  siReacthookform,
  siReactquery,
  siSass,
  siShadcnui,
  siSpringboot,
  siTailwindcss,
  siTypescript,
  siVuedotjs,
  siZod,
  type SimpleIcon,
} from "simple-icons";

/**
 * 스킬 이름 → 브랜드 아이콘 (소유자 지시, 2026-09-04 — "스킬에는 아이콘이 있도록").
 *
 * 출처는 `simple-icons`(CC0) 다. 키는 `src/content/site.ts` 의 `skillGroups[].items[].name`
 * 문자열 그대로다 — 이름이 바뀌면 여기도 바뀌어야 하고, 없는 이름은 아이콘 없이 그린다
 * (`SkillsSection.tsx` 의 대체 점). 없는 것은 브랜드가 없는 기술(Zustand · IndexedDB ·
 * 「반응형」)이거나 특정 제품을 가리키면 사실을 넘는 것(「SQL / RDB」)이다.
 *
 * 색은 아이콘의 브랜드색(`hex`)을 그대로 쓴다. DESIGN_SYSTEM.md §3 의 「채도 있는 색은
 * 강조 하나」규칙의 예외이고, 근거는 참조 사이트(aarab.me)의 SKILLS 가 그렇게 하기
 * 때문이다 — 알약 안의 16px 아이콘은 신호가 아니라 **식별자**다.
 */
export const SKILL_ICONS: Readonly<Record<string, SimpleIcon>> = {
  "JavaScript (ES6+)": siJavascript,
  TypeScript: siTypescript,
  "React 19": siReact,
  "Next.js 15 App Router": siNextdotjs,
  "HTML5 / CSS3": siHtml5,
  "TanStack Query": siReactquery,
  "Context API": siReact,
  Axios: siAxios,
  "Tailwind CSS v4": siTailwindcss,
  Radix: siRadixui,
  "shadcn/ui": siShadcnui,
  Sass: siSass,
  Zod: siZod,
  "Jest + RTL": siJest,
  "React Hook Form": siReacthookform,
  MSW: siMockserviceworker,
  "Firebase Functions": siFirebase,
  "Firestore 모델링": siFirebase,
  "Firebase Auth": siFirebase,
  "Python (BS4 / Selenium)": siPython,
  "Java / Spring Boot": siSpringboot,
  "Vue 3 / Pinia": siVuedotjs,
  "Git / GitHub Flow": siGit,
  "ESLint / Prettier": siEslint,
  "Husky / commitlint": siCommitlint,
  "PR · 이슈 템플릿": siGithub,
  문서화: siMarkdown,
};
