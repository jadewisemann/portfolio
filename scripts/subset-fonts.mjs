// 웹폰트 서브셋 생성기.
//
// 왜 필요한가: next/font/google 은 korean 서브셋을 지원하는 서체가 0종이므로
// (Next 16.3.3 의 font-data.json 을 다시 확인했다 — 2026-09-03 기준 0종) 한글 웹폰트를
// 그 경로로 실을 수 없다. 원본 한글 서체는 웨이트당 2.3 ~ 12MB 라 통째로 실을 수 없다.
// 그래서 서체는 전부 Google Fonts 에서 오지만, 적재는 `next/font/local` 로 한다.
//
// 서체 조합 세 벌 (화면에서 고를 수 있다 — `src/components/site/SettingsMenu.tsx`):
//
//   grotesk — Space Grotesk · Gothic A1    · JetBrains Mono   (기본)
//   serif   — Fraunces      · Noto Serif KR · JetBrains Mono
//   plex    — IBM Plex Sans KR (라틴 · 한글 겸용) · IBM Plex Mono
//
// 라틴 서체에는 한글이 없다. 글꼴 스택이 `라틴, 한글, 대체` 순이므로 한글 글리프는
// 둘째 자리에서 그려진다 — 그래서 라틴 서체의 필수 문자 가드는 ASCII 만 요구한다.
//
// 무엇을 넣는가: 이 사이트가 실제로 출력하는 문자만 넣는다. 사이트의 한국어는
// 닫힌 유한 집합이므로 원고에서 글리프를 뽑는 것이 가장 작고 정확하다.
//
// 원고가 바뀌면 다시 돌려야 한다: npm run fonts
// CORPUS 에 나열된 파일이 원고의 출처다. 실제 카피가 데이터 모듈로 옮겨지면
// 그 모듈을 CORPUS 에 추가한다.

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import subsetFont from "subset-font";

const SRC = "src/fonts/_src";
const OUT = "src/fonts";

/*
  원고 출처 — `src` 아래의 모든 `.ts` · `.tsx` 다 (주석은 걷어낸다).

  개정 (2026-09-03): 이전 출처는 `docs/portfolio` 의 문서 셋이었다. 그것은 **원장**이지
  화면이 아니다. 화면에 나가는 한국어는 전부 소스의 문자열 리터럴이므로, 원장을 넣으면
  화면에 없는 글자까지 굽고(문서에만 있는 한글 580자) 정작 컴포넌트에 직접 박힌 문구는
  빠질 수 있었다. 출처를 소스로 바꾸면 두 방향이 동시에 고쳐진다.

  여기 없는 문자는 서브셋에 들어가지 않으므로 OS 대체 글꼴로 렌더된다 — 한 줄 안에서
  서체가 갈리는 결함이고 눈으로는 잘 안 보인다. 그래서 출처를 좁히는 대신 `src` 전체를
  넣는다.
*/
async function corpusFiles() {
  const entries = await readdir("src", { recursive: true, encoding: "utf8" });
  return entries
    .map((f) => `src/${f.replaceAll("\\", "/")}`)
    .filter((f) => /\.(ts|tsx)$/.test(f));
}

// 원고에 없더라도 UI 가 반드시 쓰는 문자. 서체 역할별로 나눈다.
//
// 이 구분이 필요한 이유: 아래 가드를 처음 돌렸을 때 `↺`(U+21BA)가 Sans KR 에 없다고
// 잡혔다. 확인해 보니 `↺`는 Mono 에만 있고 Sans KR 에는 없다. 거터와 주석 트랙은
// 아트 디렉션상 항상 등폭이므로 기호를 Sans KR 에 요구할 이유가 없다.
// **거터 기호는 등폭으로만 렌더할 수 있다**는 것이 이제 하드 제약이다.
//
// 처음 잡았던 `⟲`(U+27F2)는 두 서체 모두에 없어서 `↺`(U+21BA)로 바꿨다 (2026-08-31 cmap 확인).
const ASCII = Array.from({ length: 0x7f - 0x20 }, (_, i) =>
  String.fromCharCode(0x20 + i),
).join("");

// 두 서체 모두에 필요한 것 — 본문에 섞이는 문자
const ALWAYS_TEXT = ASCII + "·—–…“”‘’→←↑↓×";

/*
  컴포넌트에 직접 박힌 UI 문구. 원장에도 데이터 모듈에도 없으므로 여기 적는다.
  빠지면 그 글자만 OS 대체 글꼴로 떨어지고, 한 줄 안에서 서체가 갈린다.
*/
const ALWAYS_UI = "설정테마서체라이트다크시스템닫기본문으로건너뛰기절로이동";

// 등폭 전용 — 거터 기호 5종
const ALWAYS_MONO = "−+~↺=";

// 한글 자모 (조합 표기가 필요한 경우). Sans KR 전용이다.
const JAMO = "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ";

/*
  가변 서체는 축을 고정해 정적 인스턴스로 굽는다 (`variationAxes`). 가변으로 두면 파일이
  커지고, 이 사이트는 웨이트를 400 과 600 둘만 쓰므로 가변 축이 필요 없다.

  Fraunces 는 축이 넷이다. `opsz`(광학 크기)는 큰 조판에 맞춰 144 로, `SOFT`(끝단의
  둥글기)는 0 으로, `WONK`(비관습적 글자꼴)는 1 로 고정한다 — WONK 를 켜는 것이 이
  서체를 고른 이유다.
*/
const targets = [
  // ── plex ──
  { file: "IBMPlexSansKR-Regular.ttf", out: "plex-sans-kr-400.woff2", korean: true, required: ALWAYS_TEXT },
  { file: "IBMPlexSansKR-SemiBold.ttf", out: "plex-sans-kr-600.woff2", korean: true, required: ALWAYS_TEXT },
  // 등폭은 라틴과 기호만 쓴다. 한글을 등폭으로 조판하지 않는다.
  { file: "IBMPlexMono-Regular.ttf", out: "plex-mono-400.woff2", korean: false, required: ALWAYS_TEXT + ALWAYS_MONO },

  // ── grotesk (기본) ──
  { file: "SpaceGrotesk.ttf", out: "space-grotesk-400.woff2", korean: false, required: ASCII, axes: { wght: 400 } },
  { file: "SpaceGrotesk.ttf", out: "space-grotesk-600.woff2", korean: false, required: ASCII, axes: { wght: 600 } },
  { file: "GothicA1-Regular.ttf", out: "gothic-a1-400.woff2", korean: true, required: ALWAYS_TEXT },
  { file: "GothicA1-SemiBold.ttf", out: "gothic-a1-600.woff2", korean: true, required: ALWAYS_TEXT },
  { file: "JetBrainsMono.ttf", out: "jetbrains-mono-400.woff2", korean: false, required: ASCII, axes: { wght: 400 } },

  // ── serif ──
  { file: "Fraunces.ttf", out: "fraunces-400.woff2", korean: false, required: ASCII, axes: { wght: 400, opsz: 144, SOFT: 0, WONK: 1 } },
  { file: "Fraunces.ttf", out: "fraunces-600.woff2", korean: false, required: ASCII, axes: { wght: 600, opsz: 144, SOFT: 0, WONK: 1 } },
  { file: "NotoSerifKR.ttf", out: "noto-serif-kr-400.woff2", korean: true, required: ALWAYS_TEXT, axes: { wght: 400 } },
  { file: "NotoSerifKR.ttf", out: "noto-serif-kr-600.woff2", korean: true, required: ALWAYS_TEXT, axes: { wght: 600 } },
];

const isKorean = (cp) =>
  (cp >= 0xac00 && cp <= 0xd7a3) || // 음절
  (cp >= 0x1100 && cp <= 0x11ff) || // 자모
  (cp >= 0x3130 && cp <= 0x318f); // 호환 자모

/*
  `.ts` 원고에서는 주석을 걷어낸다.

  왜: 이 저장소의 소스 주석은 한국어로 길게 쓰여 있고, 화면에는 한 글자도 나가지 않는다.
  주석까지 구우면 한글 글리프가 두 배 넘게 늘고 그만큼 파일이 무거워진다. 화면에
  나가는 것은 문자열 리터럴이므로 주석만 지우면 커버리지는 그대로이고 무게만 빠진다.

  문자열 안의 `//`(URL 의 `https://`)를 지우지 않도록 앞에 `:` 가 없을 때만 지운다 —
  `src/motion-ownership.test.ts` 와 같은 절충이고, 과하게 지워도 이 용도에서는 글리프가
  몇 개 빠질 뿐이므로 아래 필수 문자 가드가 그것을 잡는다.
*/
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

async function corpusText() {
  let text = ALWAYS_TEXT + ALWAYS_MONO + ALWAYS_UI + JAMO;
  for (const file of await corpusFiles()) {
    text += stripComments(await readFile(file, "utf8"));
  }
  return text;
}

function glyphSet(text, { korean }) {
  const set = new Set();
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp < 0x20 && ch !== "\n") continue;
    if (!korean && isKorean(cp)) continue;
    set.add(ch);
  }
  return [...set].sort().join("");
}

// 원본 TTF 의 cmap 을 읽어 수록 코드포인트를 뽑는다.
// 폰트에 없는 문자는 브라우저가 조용히 대체 글꼴로 그리므로 눈으로는 잘 안 보인다.
function cmapCodepoints(buf) {
  const numTables = buf.readUInt16BE(4);
  let cmapOff = null;
  for (let i = 0; i < numTables; i++) {
    const o = 12 + i * 16;
    if (buf.toString("ascii", o, o + 4) === "cmap") cmapOff = buf.readUInt32BE(o + 8);
  }
  if (cmapOff === null) throw new Error("cmap 테이블이 없다");
  const n = buf.readUInt16BE(cmapOff + 2);
  let best = null, bestFmt = -1;
  for (let i = 0; i < n; i++) {
    const o = cmapOff + 4 + i * 8;
    const pid = buf.readUInt16BE(o), eid = buf.readUInt16BE(o + 2);
    const off = cmapOff + buf.readUInt32BE(o + 4);
    const fmt = buf.readUInt16BE(off);
    if (((fmt === 12 && pid === 3) || (fmt === 4 && pid === 3 && eid === 1)) && fmt > bestFmt) {
      bestFmt = fmt; best = off;
    }
  }
  const set = new Set();
  if (bestFmt === 4) {
    const segX2 = buf.readUInt16BE(best + 6), seg = segX2 / 2;
    const endO = best + 14, startO = endO + segX2 + 2;
    const deltaO = startO + segX2, rangeO = deltaO + segX2;
    for (let i = 0; i < seg; i++) {
      const end = buf.readUInt16BE(endO + i * 2), start = buf.readUInt16BE(startO + i * 2);
      const delta = buf.readInt16BE(deltaO + i * 2), ro = buf.readUInt16BE(rangeO + i * 2);
      if (start === 0xffff) continue;
      for (let c = start; c <= end; c++) {
        let g;
        if (ro === 0) g = (c + delta) & 0xffff;
        else {
          const gi = rangeO + i * 2 + ro + (c - start) * 2;
          if (gi + 1 >= buf.length) continue;
          g = buf.readUInt16BE(gi);
          if (g) g = (g + delta) & 0xffff;
        }
        if (g) set.add(c);
      }
    }
  } else if (bestFmt === 12) {
    const nGroups = buf.readUInt32BE(best + 12);
    for (let i = 0; i < nGroups; i++) {
      const o = best + 16 + i * 12;
      const s0 = buf.readUInt32BE(o), e0 = buf.readUInt32BE(o + 4);
      for (let c = s0; c <= e0; c++) set.add(c);
    }
  } else throw new Error("지원하는 cmap 포맷이 없다");
  return set;
}

// 원본이 없으면 (새로 클론한 저장소) 경고만 하고 통과한다.
// 이 스크립트는 검증 게이트에 들어가므로, 원본 부재로 게이트를 막지 않는다.
// 이미 생성된 woff2 는 저장소에 커밋되어 있으므로 빌드는 성립한다.
try {
  await readFile(path.join(SRC, targets[0].file));
} catch {
  console.warn(`원본 ttf 가 ${SRC} 에 없어 서브셋 생성을 건너뛴다.`);
  console.warn(`원고를 고쳤다면 npm run fonts:fetch 로 원본을 받고 다시 돌려라.`);
  process.exit(0);
}

const text = await corpusText();
await mkdir(OUT, { recursive: true });

const report = [];
for (const t of targets) {
  const original = await readFile(path.join(SRC, t.file));
  const chars = glyphSet(text, t);

  // 가드: 이 서체가 반드시 담아야 하는 문자가 원본에 없으면 실패한다.
  const covered = cmapCodepoints(original);
  const missing = [...t.required].filter((ch) => {
    const cp = ch.codePointAt(0);
    return cp >= 0x21 && !covered.has(cp);
  });
  if (missing.length) {
    console.error(`
${t.file} 에 없는 필수 문자 ${missing.length}개:`);
    for (const ch of missing) {
      console.error(`  ${ch}  U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`);
    }
    console.error("이 문자들은 브라우저가 조용히 대체 글꼴로 그린다. ALWAYS 를 고치거나 서체를 바꿔라.");
    process.exitCode = 1;
    continue;
  }
  const subset = await subsetFont(original, chars, {
    targetFormat: "woff2",
    ...(t.axes ? { variationAxes: t.axes } : {}),
  });
  await writeFile(path.join(OUT, t.out), subset);
  report.push({
    출력: t.out,
    글리프: chars.length,
    원본KB: Math.round(original.length / 1024),
    서브셋KB: Math.round(subset.length / 1024),
  });
}

console.table(report);
const total = report.reduce((n, r) => n + r.서브셋KB, 0);
console.log(`서브셋 합계 ${total}KB`);

// 원본 ttf 는 저장소에 두지 않는다 (합계 5.7MB). 확인만 하고 안내한다.
const left = (await readdir(SRC)).filter((f) => f.endsWith(".ttf"));
if (left.length) {
  console.log(`\n원본 ${left.length}개는 ${SRC} 에 있고 .gitignore 로 제외된다.`);
  console.log(`다른 기기에서 다시 만들 때는 npm run fonts:fetch 로 내려받는다.`);
}
