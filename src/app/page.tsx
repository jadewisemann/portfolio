/*
  이 저장소에는 개인 사실을 두지 않습니다.

  사실의 정본은 형제 저장소 `../_jadewisemann/ref/` 이고, 판단의 정본은 그 저장소의
  `DESIGN.md` 입니다. 처음에는 그 내용을 이 저장소의 문서와 모듈로 옮겨 적었는데,
  공개 저장소에 개인 사실과 제3자 실명이 올라갈 뻔했고 정본을 둘로 만드는 일이기도
  했습니다. 전부 되돌렸습니다.

  따라서 이 저장소는 **문구와 수치를 받아 렌더하는 코드**만 담습니다.
  `src/components/` 의 컴포넌트는 모든 문자열과 값을 props 로 받습니다.
  실제 콘텐츠를 어디서 어떻게 주입할지는 아직 정하지 않았습니다.
*/
export default function Home() {
  return (
    <main className="mx-auto max-w-measure px-5 py-16" id="main">
      <h1 className="text-[26px] font-semibold leading-[1.45] md:text-[32px]">
        Frontend Engineer
      </h1>
      <p className="mt-6 font-mono text-note leading-5 text-ink-3">
        콘텐츠 주입 방식이 정해지기 전의 빈 화면입니다.
      </p>
    </main>
  );
}
