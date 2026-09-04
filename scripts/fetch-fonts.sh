#!/bin/sh
# 원본 ttf 를 내려받는다 (전부 Google Fonts · OFL-1.1). 원본 합계가 40MB 에 가까우므로
# 저장소에 두지 않는다 — `src/fonts/_src` 는 .gitignore 로 제외되고, 저장소에는
# `npm run fonts` 가 만든 서브셋 woff2 만 커밋된다.
#
# 서체 조합은 세 벌이고 화면에서 고를 수 있다 (`src/components/site/SettingsMenu.tsx`).
# 각 벌은 라틴 · 한글 · 등폭 셋으로 이루어지고, 한글 글리프는 라틴 서체에 없으므로
# 글꼴 스택의 둘째 자리(한글 서체)에서 그려진다.
#
#   grotesk — Space Grotesk · Pretendard  · (등폭 없음 — Pretendard)   (기본)
#   serif   — Fraunces      · Noto Serif KR · JetBrains Mono
#   plex    — IBM Plex Sans KR (라틴 · 한글 겸용) · IBM Plex Mono
#
# 디스플레이 서체는 조합에 딸리지 않는다. Instrument Serif 한 벌이 세 조합 모두에서
# 이름 · 절 제목 · 큰 부름말을 맡는다 (ART_DIRECTION.md 3절). 라틴 전용이므로 한글은
# 스택 둘째 자리의 조합 서체가 그린다.
#
# 출처: google/fonts 공식 저장소
set -e
BASE="https://raw.githubusercontent.com/google/fonts/main/ofl"
DIR="src/fonts/_src"
mkdir -p "$DIR"

fetch() {
  curl -sfL "$BASE/$1" -o "$DIR/$2"
  echo "  $2"
}

echo "plex —"
fetch "ibmplexsanskr/IBMPlexSansKR-Regular.ttf"  "IBMPlexSansKR-Regular.ttf"
fetch "ibmplexsanskr/IBMPlexSansKR-SemiBold.ttf" "IBMPlexSansKR-SemiBold.ttf"
fetch "ibmplexmono/IBMPlexMono-Regular.ttf"      "IBMPlexMono-Regular.ttf"
fetch "ibmplexsanskr/OFL.txt"                    "OFL-IBMPlexSansKR.txt"
fetch "ibmplexmono/OFL.txt"                      "OFL-IBMPlexMono.txt"

echo "grotesk —"
fetch "spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf"  "SpaceGrotesk.ttf"
fetch "jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf" "JetBrainsMono.ttf"
fetch "spacegrotesk/OFL.txt"                     "OFL-SpaceGrotesk.txt"
fetch "jetbrainsmono/OFL.txt"                    "OFL-JetBrainsMono.txt"

# Pretendard 는 Google Fonts 에 없다 — 원 저장소에서 받는다 (OFL-1.1).
# 한글 본문과 등폭 자리를 겸한다 (소유자 지시, 2026-09-04: "모노폰트도 그냥 프리텐다드로").
echo "pretendard —"
P="https://raw.githubusercontent.com/orioncactus/pretendard/main"
curl -sfL "$P/packages/pretendard/dist/public/static/Pretendard-Regular.otf"  -o "$DIR/Pretendard-Regular.otf";  echo "  Pretendard-Regular.otf"
curl -sfL "$P/packages/pretendard/dist/public/static/Pretendard-SemiBold.otf" -o "$DIR/Pretendard-SemiBold.otf"; echo "  Pretendard-SemiBold.otf"
curl -sfL "$P/LICENSE" -o "$DIR/OFL-Pretendard.txt"; echo "  OFL-Pretendard.txt"

echo "display —"
fetch "instrumentserif/InstrumentSerif-Regular.ttf" "InstrumentSerif-Regular.ttf"
fetch "instrumentserif/InstrumentSerif-Italic.ttf"  "InstrumentSerif-Italic.ttf"
fetch "instrumentserif/OFL.txt"                     "OFL-InstrumentSerif.txt"

echo "serif —"
fetch "fraunces/Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf" "Fraunces.ttf"
fetch "notoserifkr/NotoSerifKR%5Bwght%5D.ttf"    "NotoSerifKR.ttf"
fetch "fraunces/OFL.txt"                         "OFL-Fraunces.txt"
fetch "notoserifkr/OFL.txt"                      "OFL-NotoSerifKR.txt"

echo "내려받았다: $DIR"

# OFL-1.1 은 서브셋(파생 저작물)을 배포할 때 저작권 고지와 라이선스를 함께 배포하라고
# 요구한다. 원본은 저장소에 두지 않으므로 고지만 따로 옮겨 커밋한다.
cp "$DIR"/OFL-*.txt src/fonts/licenses/
echo "라이선스 고지: src/fonts/licenses/"
