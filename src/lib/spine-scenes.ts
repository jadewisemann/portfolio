// v1·v2·v3 세 경로가 공유하는 씬 수열입니다. SCENE_GRAPH.md 1절의 비율 수열
// 16.7% → 88% → 0% → 100% 이고, 세 경로 모두 같은 데이터를 씁니다 — 개념이 다른 것은
// 공간 모델이지 사실이 아닙니다.

import { s1, s2, s7, s9, type SeamScene } from "@/content/golden";
import { computeSpine, type SpineGeometry } from "@/lib/spine";

export type SpineSceneGeo = { scene: SeamScene; geo: SpineGeometry };

/**
 * S1 · S2 · S7 · S9 뿐입니다. S2 는 `toggle`·`disclosure`·`commit` 도 갖고 있지만
 * `SeamScene` 의 공통 부분만 이 배열이 요구합니다 — 구조적으로 호환됩니다.
 */
export const SPINE_SEQUENCE: readonly SpineSceneGeo[] = [s1, s2, s7, s9].map(
  (scene) => ({ scene, geo: computeSpine(scene.ratio) }),
);

export const SPINE_IDS: readonly string[] = SPINE_SEQUENCE.map((s) => s.scene.id);
