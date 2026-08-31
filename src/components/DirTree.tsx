"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";

/**
 * 구조 재편 트리. 이 사이트의 시그니처 인터랙션입니다 (SCENE_GRAPH.md S2).
 *
 * 왜 기성품을 쓰지 않았나: Magic UI File Tree 는 정적 트리이고 **두 구조 사이의 전이가
 * 없습니다.** 그 전이가 이 씬의 서사 전부여서 77/100 에 그쳤습니다
 * (COMPONENT_REGISTRY.md C1 · B3). 형태만 참조하고 전이는 직접 만듭니다.
 *
 * 소유권: Motion `layoutId` 단독, 320ms, --ease-travel (MOTION_LANGUAGE.md 12절 S2).
 *   칸이 **사라지고 나타나는 것이 아니라 이동해야** 합니다 — 커밋 91b3363 은 이동이고,
 *   페이드로 만들면 사실과 어긋납니다 (12.1 반려 4번).
 *
 * 칸의 라벨은 **그 구조에서의 경로**입니다. 레이어 우선에서 `components/landing` 이던
 * 것이 도메인 우선에서 `landing/components` 가 됩니다. 두 조각의 순서가 뒤집히는 것이
 * 이 재편의 정확한 서술이고, 그것을 글자로 보여줍니다.
 *
 * 파일 이름은 지어내지 않았습니다. 칸은 근거 문서의 트리에 실제로 있는 폴더 교차점입니다.
 */
export type TreeCell = { domain: string; layer: string };

type Mode = "layer" | "domain";

/** 그 구조에서의 경로. 도메인과 레이어가 같은 칸(shared)은 한 조각입니다. */
function pathOf(cell: TreeCell, mode: Mode): string {
  if (cell.domain === cell.layer) return cell.domain;
  return mode === "layer"
    ? `${cell.layer}/${cell.domain}`
    : `${cell.domain}/${cell.layer}`;
}

function keyOf(cell: TreeCell): string {
  return `${cell.domain}::${cell.layer}`;
}

/** 그룹 키의 순서를 입력 순서로 고정합니다 — 정렬을 바꾸면 이동이 뒤섞여 보입니다. */
function groupsOf(
  cells: readonly TreeCell[],
  by: (c: TreeCell) => string,
): readonly { key: string; cells: readonly TreeCell[] }[] {
  const order: string[] = [];
  const bucket = new Map<string, TreeCell[]>();

  for (const cell of cells) {
    const k = by(cell);
    if (!bucket.has(k)) {
      bucket.set(k, []);
      order.push(k);
    }
    bucket.get(k)?.push(cell);
  }

  return order.map((key) => ({ key, cells: bucket.get(key) ?? [] }));
}

function Side({
  groups,
  mode,
  active,
  duration,
  heading,
}: {
  groups: readonly { key: string; cells: readonly TreeCell[] }[];
  mode: Mode;
  /** 이 쪽이 지금 칸을 담고 있는가. 담지 않으면 폴더 골격만 보입니다. */
  active: boolean;
  duration: number;
  heading: string;
}) {
  return (
    <div className="tree-side" data-active={active ? "" : undefined}>
      <p className="tree-heading">{heading}</p>
      <ul className="tree-groups">
        {groups.map((group) => (
          <li className="tree-group" key={group.key}>
            <p className="tree-group-name">
              {group.key}
              <span className="tree-count">{group.cells.length}</span>
            </p>
            <ul className="tree-cells">
              {active
                ? group.cells.map((cell) => (
                    <motion.li
                      className="tree-chip"
                      key={keyOf(cell)}
                      // 같은 아이덴티티를 유지한 채 반대편 구조의 자리로 이동합니다.
                      layoutId={keyOf(cell)}
                      transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
                    >
                      {pathOf(cell, mode)}
                    </motion.li>
                  ))
                : null}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DirTree({
  cells,
  labels,
}: {
  cells: readonly TreeCell[];
  labels: { label: string; layerFirst: string; domainFirst: string };
}) {
  const [mode, setMode] = useState<Mode>("layer");
  const reduced = useReducedMotion();
  const groupId = useId();

  // 축소 모션에서 이동을 없애되 **기능은 남깁니다** (MOTION_LANGUAGE.md 13절).
  const duration = reduced ? 0 : 0.32;

  const layerGroups = groupsOf(cells, (c) => c.layer);
  const domainGroups = groupsOf(cells, (c) => c.domain);

  return (
    <div className="tree-block">
      <div aria-labelledby={groupId} className="tree-toggle" role="group">
        <p className="tree-toggle-label" id={groupId}>
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

      <div className="tree" data-mode={mode}>
        <Side
          active={mode === "layer"}
          duration={duration}
          groups={layerGroups}
          heading={labels.layerFirst}
          mode={mode}
        />
        {/* 이음선과 같은 자리(50%)에 오는 경계입니다. 칸이 이 선을 넘어갑니다. */}
        <div aria-hidden="true" className="tree-line" />
        <Side
          active={mode === "domain"}
          duration={duration}
          groups={domainGroups}
          heading={labels.domainFirst}
          mode={mode}
        />
      </div>
    </div>
  );
}
