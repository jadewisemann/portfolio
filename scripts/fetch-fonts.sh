#!/bin/sh
# IBM Plex 원본 ttf 를 내려받는다 (OFL-1.1). 원본은 합계 5.7MB 라 저장소에 두지 않는다.
# 출처: google/fonts 공식 저장소
set -e
BASE="https://raw.githubusercontent.com/google/fonts/main/ofl"
DIR="src/fonts/_src"
mkdir -p "$DIR"
curl -sL "$BASE/ibmplexsanskr/IBMPlexSansKR-Regular.ttf"  -o "$DIR/IBMPlexSansKR-Regular.ttf"
curl -sL "$BASE/ibmplexsanskr/IBMPlexSansKR-SemiBold.ttf" -o "$DIR/IBMPlexSansKR-SemiBold.ttf"
curl -sL "$BASE/ibmplexmono/IBMPlexMono-Regular.ttf"      -o "$DIR/IBMPlexMono-Regular.ttf"
curl -sL "$BASE/ibmplexsanskr/OFL.txt"                    -o "$DIR/OFL-IBMPlexSansKR.txt"
echo "내려받았다: $DIR"
