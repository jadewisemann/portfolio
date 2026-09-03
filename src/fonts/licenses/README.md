# 웹폰트 라이선스 고지

`src/fonts/*.woff2` 는 전부 Google Fonts 원본의 **서브셋**이다. 원본 ttf 는 저장소에
두지 않고(`src/fonts/_src/`, `.gitignore` 로 제외) `npm run fonts:fetch` 로 받는다.

서브셋은 OFL-1.1 이 말하는 파생 저작물(Modified Version)이므로, 배포할 때 저작권 고지와
라이선스 전문을 함께 배포해야 한다. 이 디렉터리가 그 요구를 만족시킨다 — 원본 저장소의
`OFL.txt` 를 그대로 옮겨 온 것이고 내용을 고치지 않았다.

| 파일 | 서체 | 쓰는 조합 |
|---|---|---|
| `OFL-SpaceGrotesk.txt` | Space Grotesk | grotesk (라틴) |
| `OFL-GothicA1.txt` | Gothic A1 | grotesk (한글) |
| `OFL-JetBrainsMono.txt` | JetBrains Mono | grotesk · serif (등폭) |
| `OFL-Fraunces.txt` | Fraunces | serif (라틴) |
| `OFL-NotoSerifKR.txt` | Noto Serif KR | serif (한글) |
| `OFL-IBMPlexSansKR.txt` | IBM Plex Sans KR | plex (라틴 · 한글) |
| `OFL-IBMPlexMono.txt` | IBM Plex Mono | plex (등폭) |

서체를 더하거나 빼면 `scripts/fetch-fonts.sh` 와 이 표를 함께 고친다. 스크립트가
`_src` 의 `OFL-*.txt` 를 이 디렉터리로 복사하므로, 새 서체의 `OFL.txt` 도 스크립트에
추가해야 고지가 따라온다.
