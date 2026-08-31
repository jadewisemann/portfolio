import type { Metadata } from "next";
import { mono, sansKR } from "@/fonts";
import "./globals.css";

/*
  메타데이터도 콘텐츠입니다. 개인 사실을 이 저장소에 두지 않기로 했으므로
  주입 방식이 정해질 때 채웁니다.
*/
export const metadata: Metadata = {
  title: "Frontend Engineer",
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
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: 'document.documentElement.dataset.js="1"',
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
