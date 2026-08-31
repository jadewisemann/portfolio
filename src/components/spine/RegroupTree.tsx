"use client";

import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import type { TreeCell } from "@/content/golden";

/**
 * S2 구조 재편 트리 — 세 경로(v1·v2·v3) 공통 시그니처 (SCENE_GRAPH.md "S2 재설계").
 *
 * `src/components/DirTree.tsx` 는 좌/우 두 패널을 두고 칩을 한쪽에서 다른 쪽으로
 * 날리는 iteration 0 구조를 아직 쓰고 있고(그 결함은 실측되어 있다 — 토글 후 한 패널이
 * 484×733px 에 잉크 1.28%), 홈페이지 GOLDEN_FIX 가 별도로 그것을 다루는 중이다.
 * 이 파일은 그 재설계를 새로 구현한다: **패널은 하나다.** 칸 31개가 항상 한 벌로
 * 존재하고, 토글은 그 31개를 레이어 묶음에서 도메인 묶음으로 **제자리에서** 다시 묶는다.
 * 칸의 라벨은 불변이다 — 바뀌는 것은 칸이 속한 묶음과 그 자리뿐이다.
 *
 * 소유권: Motion `layout="position"` (S2, MOTION_LANGUAGE.md 12절), 320ms(장면 내 대역),
 * `--ease-travel`. 크기를 보간하지 않으므로(`layout="position"`) 등폭 활자가 늘어나지
 * 않는다. `LayoutGroup` 이 묶음의 리플로를 함께 정렬한다. 목적지 묶음별로 스태거한다
 * (항목당 ≤60ms, 총 ≤240ms) — 31개가 동시에 가로지르는 게 아니라 **묶음이 모이는 것**
 * 으로 읽혀야 한다 (SCENE_GRAPH.md "S2 재설계"). 축소 모션에서는 이동 없이 즉시
 * 최종 배치이지만 토글 기능은 남는다 (MOTION_LANGUAGE.md 13절).
 */
type Mode = "layer" | "domain";

function keyOf(cell: TreeCell): string {
  return `${cell.domain}::${cell.layer}`;
}

function pathOf(cell: TreeCell, mode: Mode): string {
  if (cell.domain === cell.layer) return cell.domain;
  return mode === "layer" ? `${cell.layer}/${cell.domain}` : `${cell.domain}/${cell.layer}`;
}

function groupsOf(
  cells: readonly TreeCell[],
  mode: Mode,
): readonly { key: string; cells: readonly TreeCell[] }[] {
  const order: string[] = [];
  const bucket = new Map<string, TreeCell[]>();
  for (const cell of cells) {
    const k = mode === "layer" ? cell.layer : cell.domain;
    if (!bucket.has(k)) {
      bucket.set(k, []);
      order.push(k);
    }
    bucket.get(k)?.push(cell);
  }
  return order.map((key) => ({ key, cells: bucket.get(key) ?? [] }));
}

const TRAVEL_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
/** 항목당 최대 60ms, 총 240ms 상한 (MOTION_LANGUAGE.md 4절). */
const STAGGER_STEP = 0.05;
const STAGGER_CAP = 0.24;

export function RegroupTree({
  cells,
  labels,
}: {
  cells: readonly TreeCell[];
  labels: { label: string; layerFirst: string; domainFirst: string };
}) {
  const [mode, setMode] = useState<Mode>("layer");
  const reduced = useReducedMotion();
  const groupId = useId();
  const groups = groupsOf(cells, mode);
  const duration = reduced ? 0 : 0.32;

  return (
    <div className="sp-tree">
      <div aria-labelledby={groupId} className="sp-tree-toggle font-mono" role="group">
        <p className="sp-tree-toggle-label" id={groupId}>
          {labels.label}
        </p>
        <button
          aria-pressed={mode === "layer"}
          onClick={() => setMode("layer")}
          type="button"
        >
          {labels.layerFirst}
        </button>
        <button
          aria-pressed={mode === "domain"}
          onClick={() => setMode("domain")}
          type="button"
        >
          {labels.domainFirst}
        </button>
      </div>

      <LayoutGroup id={groupId}>
        <ul className="sp-tree-groups">
          {groups.map((group) => (
            <motion.li
              className="sp-tree-group"
              key={group.key}
              layout="position"
              transition={{ duration, ease: TRAVEL_EASE }}
            >
              <p className="sp-tree-group-name font-mono">
                {group.key}
                <span className="sp-tree-count">{group.cells.length}</span>
              </p>
              <ul className="sp-tree-cells">
                {group.cells.map((cell, i) => (
                  <motion.li
                    className="sp-tree-chip font-mono"
                    key={keyOf(cell)}
                    layout="position"
                    transition={{
                      duration,
                      ease: TRAVEL_EASE,
                      delay: reduced ? 0 : Math.min(i * STAGGER_STEP, STAGGER_CAP),
                    }}
                  >
                    {pathOf(cell, mode)}
                  </motion.li>
                ))}
              </ul>
            </motion.li>
          ))}
        </ul>
      </LayoutGroup>
    </div>
  );
}
