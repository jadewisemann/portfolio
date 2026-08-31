---
name: portfolio-build
description: Runs the complete autonomous portfolio experience engineering workflow.
disable-model-invocation: true
allowed-tools: Read Write Edit Grep Glob Bash Agent
---

# Portfolio Build Orchestrator

This skill controls the complete portfolio development lifecycle.

The single source of truth for the graph is `docs/portfolio/graph.json`:
node order, executor bindings (agents/skill), required outputs, evidence
directories, gate thresholds, iteration limits, and edges all live there.
Do not maintain a second copy of the graph anywhere, including here.

The single writer of `docs/portfolio/state.json` is `node scripts/graph.mjs`.
Hand-editing state.json is corruption.

## Boot

1. Read CLAUDE.md, docs/portfolio/graph.json, docs/portfolio/DECISIONS.md.
2. `node scripts/graph.mjs status`
3. If inactive: `node scripts/graph.mjs start`
4. If a blocker is recorded, resolve it (or ask the user), then
   `node scripts/graph.mjs unblock`.

## Node loop

At every node, in order:

1. `node scripts/graph.mjs status` — it prints the node's executor binding,
   unmet requirements, and available transitions.
2. Do the work the node declares:
   - `agents` listed → delegate. `parallel: true` → launch them in a single
     message so they run concurrently.
   - `skill` listed → that skill defines the working procedure.
   - `owner: main` → judge and persist in this context; do not delegate
     final judgement.
3. Persist decisions in the declared output docs and DECISIONS.md.
4. `node scripts/graph.mjs advance`
   - The engine enforces outputs, evidence files, gates, and verification
     tiers. If it refuses, produce what is missing; never work around it.
5. Repeat until COMPLETE or a genuine blocker
   (`node scripts/graph.mjs block "<reason>"`).

Never invent portfolio facts. Never skip graph nodes.

## Golden gate

GOLDEN_REVIEW requires:

- rendered evidence in `review/golden-slice/` — produce it with
  `node scripts/capture.mjs review/golden-slice`;
- numeric scores with evidence in `docs/portfolio/scorecard.json`
  (mirror the table in SCORECARD.md for humans).

The engine compares scores against graph.json thresholds and picks the edge
itself: pass → EXPAND_SCENES, fail → GOLDEN_FIX (iteration increments).
After 3 failed iterations on the same structure the engine forces
GOLDEN_FIX → STRUCTURAL_BRANCH. A critic may demand an early structural
branch: `node scripts/graph.mjs advance exhausted` from GOLDEN_FIX, with the
rationale recorded in DECISIONS.md under `## Structural branch`.

## Verification tiers

`.claude/runtime.json`:

- `builder` (lint, typecheck, unit tests) — runs automatically when
  frontend-builder stops.
- `gate` (adds e2e, which builds and serves production) — runs once at the
  REGRESSION node via the engine. Do not run it per-change.

## Completion

The engine refuses to enter COMPLETE until FINAL_AUDIT.md is no longer a
placeholder, and the REGRESSION node's gate tier passed. FINAL_AUDIT.md must
record rendered full-site inspection, mobile inspection, performance audit,
accessibility audit, and regression results with evidence paths.
