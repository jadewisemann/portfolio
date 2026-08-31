import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // 화면에 나가는 수치는 src/data/readings.ts 를 통해서만 도달해야 한다.
    // ART_DIRECTION.md 2절에서 B 방향으로부터 차용한 게이트다.
    //
    // 근거: 정본에서 손으로 옮겨 적는 행위가 실제로 오류를 두 건 만들었다.
    // 한 번은 하한 값 누락이었고, 한 번은 서로 다른 두 집계의 분자와 분모를 섞은 것이었다.
    // 사람의 성실성이 아니라 린트가 이것을 막는다.
    files: ["src/**/*.tsx"],
    ignores: ["src/**/*.test.tsx", "src/data/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          // JSX 텍스트 노드 안의 숫자. 연도나 버전도 포함해 일단 막고,
          // 정말 필요하면 그 자리에서 명시적으로 예외를 준다.
          selector: "JSXText[value=/[0-9]/]",
          message:
            "화면에 나가는 숫자는 src/data/readings.ts 에 등록하고 reading() 으로 가져와라. 근거와 등급과 분모가 없는 수치를 막기 위한 규칙이다 (ART_DIRECTION.md 2절).",
        },
      ],
    },
  },
]);

export default eslintConfig;
