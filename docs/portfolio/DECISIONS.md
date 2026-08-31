# Decisions

## Initial setup

- The workflow graph is initialized at `BOOTSTRAP`.
- Portfolio content and visual direction are not yet supplied; agents must not invent them.
- Runtime verification commands are intentionally unconfigured until an application exists.

## Repository audit (2026-08-31)

Findings from auditing the harness and repository state:

- The v1 harness had no execution layer: transitions, gate predicates, and
  iteration counting existed only as prose. state.json never left BOOTSTRAP
  while a Next.js scaffold, Hero, fonts, and an e2e gate were already built —
  implementation ran ahead of the graph with no recorded direction.
- prevent-premature-stop keyed on `state.active`, which nothing ever set:
  a deadlock that made the stop gate permanently inert.
- verify-builder.mjs was referenced only from agent frontmatter and never ran;
  its check list double-built the app (standalone build + e2e webServer build).
- graph.json and portfolio-build/SKILL.md carried two diverging copies of the
  graph; 8 of 19 nodes had no executor binding.
- performance/accessibility auditors were required to judge rendered scenes
  without any browser or measurement pipeline.

Existing scaffold code (src/, e2e/) predates any locked art direction. It is
treated as provisional: DIRECTION_JUDGE may keep, rework, or discard it.

## Graph engine v2 (2026-08-31)

- docs/portfolio/graph.json is the single graph source of truth. Each node
  declares executors (agents/skill/owner), required outputs (regex-checked
  docs), evidence directories, gate thresholds, iteration limits, and edges.
- scripts/graph.mjs is the single writer of state.json. It enforces outputs,
  evidence, gates, and verification tiers before every transition, journals
  every transition to journal.ndjson, and forces GOLDEN_FIX → STRUCTURAL_BRANCH
  after 3 failed gate iterations. Unit-tested in scripts/graph.test.mjs.
- Golden-gate scores are machine-read from docs/portfolio/scorecard.json;
  SCORECARD.md remains the human mirror.
- Verification is tiered in .claude/runtime.json: `builder` (lint, typecheck,
  unit tests) runs on frontend-builder stop via settings.json SubagentStop;
  `gate` (adds e2e, which builds production itself — no double build) runs once
  at REGRESSION via the engine.
- Rendered evidence comes from scripts/capture.mjs (production server,
  desktop 1440 / mobile 320, normal + reduced motion) into review/ dirs, which
  gate nodes require by file count.

## Content source directive (2026-08-31)

Portfolio content facts always come from the sibling repository
`../_jadewisemann`: facts from its `ref/` wiki (evidence grades A/B only,
entry point `ref/README.md`), positioning judgment from its `DESIGN.md`.
Every fact recorded in BRIEF.md/CONTENT.md must carry its source path.
This resolves the CONTENT_INVENTORY blocker "portfolio facts not supplied".
