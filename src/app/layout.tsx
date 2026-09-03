import type { Metadata } from "next";
import { mono, sansKR } from "@/fonts";
import { hero } from "@/content/golden";
import "./globals.css";

/*
  메타데이터도 콘텐츠입니다. 문구는 src/content/golden.ts 의 히어로와 같은 출처를
  씁니다 (DESIGN.md 1절 포지셔닝 v2, 근거 등급 A). PII 는 넣지 않습니다.
*/
export const metadata: Metadata = {
  title: "jadewisemann — 프론트엔드",
  description: hero.lines[0],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${sansKR.variable} ${mono.variable} h-full antialiased`}
      // 아래 인라인 스크립트가 하이드레이션 전에 data-js 를 붙이므로 서버 HTML 과
      // 클라이언트 DOM 이 이 속성에서 달라집니다. 의도된 차이입니다.
      suppressHydrationWarning
    >
      <head>
        {/*
          첫 페인트 전에 data-js 를 세웁니다 (MOTION_LANGUAGE.md 9.1 다).
          히어로의 초기 은닉을 [data-js] 아래에서만 적용하므로, JS 가 차단되면
          은닉이 적용되지 않아 포지셔닝 두 문장이 완전히 보입니다.

          같은 스크립트가 축소 모션 여부도 첫 페인트 전에 결정합니다
          (MOTION_LANGUAGE.md 13.1, GOLDEN_FIX 1). Motion 의 `useReducedMotion()` 은
          하이드레이션 이후에야 해석되므로, 그때까지 서버 HTML 의 인라인
          opacity:0(Motion 의 `initial`)이 그대로 페인트됩니다 — 실측 192ms
          (6x 스로틀 1399ms). data-motion-reduce 는 이 스크립트가 body 를 파싱하기
          전에 세우므로 아래 !important 규칙이 Motion 의 인라인 스타일보다 먼저
          이깁니다.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'var d=document.documentElement;d.dataset.js="1";' +
              'if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.motionReduce="1"}',
          }}
        />
        {/*
          Motion 이 initial 상태를 서버 HTML 의 인라인 스타일로 내보내므로 위의 data-js
          게이트만으로는 부족합니다 (E2E 에서 확인). noscript 는 JS 가 비활성일 때만
          적용되므로 그 경우 은닉을 덮어씁니다.
          ponytail: JS 가 켜져 있는데 하이드레이션이 실패하는 경우는 덮지 못합니다.
          그 경우까지 막으려면 히어로를 CSS 소유로 옮겨야 하고, 그건 모션 소유권
          변경이므로 MOTION_LANGUAGE.md 를 고쳐야 합니다.
        */}
        <noscript>
          <style>{`[data-enter]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full">
        {/* DESIGN_SYSTEM.md 7절이 요구하는 스킵 링크. 첫 포커스 가능 요소입니다. */}
        <a className="skip-link" href="#main">
          본문으로 건너뛰기
        </a>
        {children}
      </body>
    </html>
  );
}
