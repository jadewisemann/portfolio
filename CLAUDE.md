# Portfolio Project

This repository uses an agent-driven portfolio development workflow.

## Source of truth

Always read:

- docs/portfolio/state.json
- docs/portfolio/ART_DIRECTION.md
- docs/portfolio/DESIGN_SYSTEM.md
- docs/portfolio/MOTION_LANGUAGE.md

before making substantial portfolio changes.

## Content source

All portfolio content facts come from the sibling repository of this repo:

`../_jadewisemann` (always resolved relative to this repo's root)

That repository has its own SSOT discipline — follow it:

- Facts: `../_jadewisemann/ref/` — start at `ref/README.md` (purpose-based
  routing table). Numbers and strong claims require evidence grade A or B in
  `ref/20_evidence.md`; grade D is forbidden.
- Judgment (positioning, what to feature, what to omit):
  `../_jadewisemann/DESIGN.md`.
- Read each project page's "과장하면 안 되는 것" / "본인 관여 없음" sections
  before using it.
- Cite `ref/` documents, not raw document dumps in that repo.

CONTENT_INVENTORY extracts from there into docs/portfolio/BRIEF.md and
docs/portfolio/CONTENT.md, recording the source path for every fact. A fact
not present in `ref/` does not go into the portfolio.

## Core rules

- Never hand-edit docs/portfolio/state.json — all transitions go through
  `node scripts/graph.mjs` (status / start / advance / block / doctor).
- Do not invent portfolio facts.
- Search existing components before creating complex visual components.
- Do not mix animation ownership.
- Render and inspect visual work before declaring completion.
- Update state.json and DECISIONS.md after major graph transitions.

## Workflow

The primary coordinator is:

portfolio-director

The complete workflow is defined by:

/portfolio-build

## Visual sources

Prefer researching:

- React Bits
- 21st.dev
- Aceternity UI
- Magic UI
- Codrops

before implementing complex interaction from scratch.

## Motion ownership

GSAP:
scroll choreography

Motion:
component and shared layout transitions

CSS:
minor interactions

Three.js / R3F:
explicit 3D scenes only

Lenis:
scroll transport only