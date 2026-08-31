"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";

/**
 * 히어로. 사이트에서 타이포그래피 모션은 이것 하나뿐입니다 (MOTION_LANGUAGE.md 9절).
 *
 * 소유자: Motion 단독. 로드 시 1회 400ms (줄당 340ms + 둘째 줄 60ms 지연).
 * translateY 14px = 28px 리듬의 절반. 줄이 자기 행 상자 안에서 올라와 괘선에 앉습니다.
 *
 * 억제 규칙:
 *   - 축소 모션에서 최종 상태를 즉시 렌더하고 초기 상태를 거치지 않습니다.
 *   - 언어 토글과 테마 변경에서 재생하지 않습니다. `key` 를 텍스트에서 떼고
 *     문서 수명 동안 1회만 재생합니다.
 *   - IO 에 걸지 않습니다. 로드 이벤트이고 스크롤 이벤트가 아닙니다.
 *
 * 히어로 활자는 320px 실측으로 정한 4단계입니다 (DESIGN_SYSTEM.md 4절).
 * clamp() 를 쓰지 않습니다 — 32px 과 30px 사이에 6줄에서 4줄로 뛰는 불연속이 있어
 * 연속 보간은 60vh 상한을 깨는 구간을 반드시 통과합니다.
 */
/**
 * 문서 수명 동안 1회만 재생하기 위한 래치입니다.
 *
 * 왜 useState 가 아닌가: 상태로 두면 재생 여부가 렌더 사이에 바뀌어 `initial` 이
 * 도중에 달라집니다. 요구사항은 컴포넌트 상태가 아니라 **문서 상태**입니다 —
 * 언어 토글로 다시 마운트되어도 재생하지 않아야 합니다. 한 방향으로만 뒤집히는
 * 래치이므로 서버와 클라이언트의 첫 렌더가 항상 일치합니다.
 */
let hasPlayed = false;

export function Hero({ lines }: { lines: readonly string[] }) {
  const reduced = useReducedMotion();
  const animate = !reduced && !hasPlayed;

  useEffect(() => {
    hasPlayed = true;
  }, []);

  return (
    <header className="max-w-measure pt-7 pb-7 md:pt-14 md:pb-10">
      <h1 className="text-[26px] font-semibold leading-[1.45] sm:text-[30px] md:text-[32px] lg:text-[36px]">
        {lines.map((line, i) => (
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className="block"
            data-enter=""
            // `false` 를 넘기면 Motion 이 인라인 스타일을 쓰지 않아
            // CSS 의 `[data-js] [data-enter] { opacity: 0 }` 가 영구히 이깁니다.
            // 재생하지 않는 경우에도 최종 상태를 명시해 은닉을 반드시 덮어씁니다.
            initial={animate ? { opacity: 0, y: 14 } : { opacity: 1, y: 0 }}
            // key 를 인덱스로 고정합니다. 텍스트에 묶으면 언어 토글에서 재마운트됩니다.
            key={i}
            transition={{
              duration: 0.34,
              delay: i * 0.06,
              ease: [0.2, 0, 0, 1],
            }}
          >
            {line}
          </motion.span>
        ))}
      </h1>
    </header>
  );
}
