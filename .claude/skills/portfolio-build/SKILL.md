---
name: portfolio-build
description: Runs the complete autonomous portfolio experience engineering workflow.
disable-model-invocation: true
allowed-tools: Read Write Edit Grep Glob Bash Agent
---

# Portfolio Build Orchestrator

This skill controls the complete portfolio development lifecycle.

Read first:

- CLAUDE.md
- docs/portfolio/graph.json
- docs/portfolio/state.json

If state.active is false:

set:

active = true
status = RUNNING

Never invent portfolio facts.

Never skip graph nodes.

At every graph node:

1. Read current state.
2. Determine required specialist agents.
3. Delegate independent work in parallel when appropriate.
4. Collect results.
5. Judge results.
6. Persist decisions.
7. Update currentNode.
8. Continue.

The main conversation is responsible for orchestration.

Specialist agents should perform scoped work and return evidence.

# Graph

BOOTSTRAP
→ REPOSITORY_AUDIT
→ CONTENT_INVENTORY
→ COMPONENT_RESEARCH
→ ART_DIRECTION_BRANCH
→ DIRECTION_JUDGE
→ DESIGN_SYSTEM
→ MOTION_SYSTEM
→ SCENE_GRAPH
→ GOLDEN_SLICE
→ GOLDEN_REVIEW
→ EXPAND_SCENES
→ WHOLE_EXPERIENCE_AUDIT
→ MOBILE_AUDIT
→ PERFORMANCE_AUDIT
→ ACCESSIBILITY_AUDIT
→ REGRESSION
→ COMPLETE

# Parallelization

Use parallel specialist agents when work is independent.

Examples:

COMPONENT_RESEARCH:
run multiple scouting tasks.

GOLDEN_REVIEW:
run visual, motion, performance and accessibility critics independently.

Do not parallelize dependent work.

# Golden Slice Gate

The Golden Slice includes:

- Hero
- Hero → Projects transition
- One representative project scene

It must pass:

Visual Impact >= 9
Art Direction >= 9
Motion Coherence >= 9
Typography >= 8.5
Originality >= 8.5
Narrative Clarity >= 8
Mobile >= 8

If a category fails:

patch.

After three failed polishing iterations on the same structure:

branch structurally.

# Completion

Do not set state.status to COMPLETE until:

- rendered experience was inspected;
- mobile was inspected;
- performance audit passed;
- accessibility audit passed;
- regression passed;
- FINAL_AUDIT.md exists.

When complete:

active = false
status = COMPLETE
currentNode = COMPLETE