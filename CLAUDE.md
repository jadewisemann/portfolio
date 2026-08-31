# Portfolio Project

This repository uses an agent-driven portfolio development workflow.

## Source of truth

Always read:

- docs/portfolio/state.json
- docs/portfolio/ART_DIRECTION.md
- docs/portfolio/DESIGN_SYSTEM.md
- docs/portfolio/MOTION_LANGUAGE.md

before making substantial portfolio changes.

## Core rules

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