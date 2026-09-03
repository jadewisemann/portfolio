import type { Metadata } from "next";
import { fontVariables } from "@/fonts";
import { BOOT_SCRIPT } from "@/lib/preferences";
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
      className={`${fontVariables} h-full antialiased`}
      // 아래 인라인 스크립트가 하이드레이션 전에 data-js · data-theme · data-font 를
      // 붙이므로 서버 HTML 과 클라이언트 DOM 이 이 속성들에서 달라집니다.
      // 의도된 차이입니다 — 이유는 src/lib/preferences.ts 의 BOOT_SCRIPT 주석에 있습니다.
      suppressHydrationWarning
    >
      <head>
        {/*
          첫 페인트 전에 네 가지를 세웁니다. 본문은 src/lib/preferences.ts 가 만들고,
          그 파일의 BOOT_SCRIPT 주석이 각 항목의 사유를 적고 있습니다.

            data-js            — 히어로 초기 은닉 게이트 (MOTION_LANGUAGE.md 9.1 다)
            data-motion-reduce — 축소 모션 (13.1)
            data-theme         — 라이트 · 다크 (「시스템」은 여기서 풀립니다)
            data-font          — 서체 조합

          테마와 서체를 리액트 상태로 두면, 저장된 값이 라이트인 사람이 첫 프레임에
          다크를 보고 하이드레이션 뒤에 흰 화면으로 뒤집힙니다. 축소 모션에서 이미
          한 번 겪은 결함(13.1)과 같은 종류이므로 같은 방법으로 막습니다.
        */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
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
