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

Explicit override (owner decision, 2026-08-31): `../_jadewisemann/DESIGN.md`
§3 says "포트폴리오 사이트를 만들지 않는다" — this repo ignores that judgment
and builds the site anyway. Do not treat §3 as a blocker or re-raise it. All
other judgments in that DESIGN.md (positioning v2, project order, forbidden
claims) remain binding.

## What the owner actually wants

The target reaction, in order: **"What the fuck, this is beautiful"** first, then
**"and this person clearly knows how to engineer interfaces."** The order is the
whole brief. Beauty arrives first; competence is proven by *how the beauty was
built*, never by explaining competence in prose.

The owner rejected the 2026-08-31 output in one word: **"이력서냐"** (is this a
résumé?). That is the sharpest signal in this repo's history. Learn the register
it names:

| Résumé register (rejected) | Portfolio register (wanted) |
|---|---|
| One column of text | Designed scenes connected by motion |
| Facts with evidence grades as footnotes | Facts as part of a scene |
| Says *what was done* | Shows *how it works* |
| 36px heading, centered band | Typography that dominates the viewport |

**Hard constraint that decides everything**: `CONTENT.md` §8 — project images
and video are **zero**. There is no media to art-direct with.

The 2026-08-31 run read that as "then use only text and thin rules," which
guarantees a document. The unused option is the better one: **the engineering
mechanisms are the visual material.** `CONTENT.md` §2.3 names the coverage
ratchet as "이 사이트의 핵심 소재" — a ratchet only moves one way, which is
motion, not a sentence. The E2E two-stage harness, the payment FSM, the
two-tier cache, the infinite-render bug: these are things that *operate*, and
what operates can be rendered. Having no screenshots does not mean having no
screens.

So: don't describe the projects — **demonstrate them.** Typography dominates on
top of that, three unforgettable moments, decoration last.

## Core rules

- Never hand-edit docs/portfolio/state.json — all transitions go through
  `node scripts/graph.mjs` (status / start / advance / block / doctor).
- Do not invent portfolio facts.
- Search existing components before creating complex visual components.
- Do not mix animation ownership.
- Update state.json and DECISIONS.md after major graph transitions.

### The browser is the truth — and this applies to the coordinator

Never judge visual work from source code, from a subagent's report, or from a
locked spec document. **Open the page and look at it.** This rule binds whoever
is coordinating, not only the builder.

The 2026-08-31 run failed on exactly this. The coordinator spent an hour
relaying the director's text reports — tuning thresholds, scorecards, iteration
order, gate integrity — all of it correct and all of it beside the point. It was
excellent project management for a project that was building the wrong thing.
The first screenshot it finally rendered showed the problem instantly. Reading
`CONTENT.md` — learning what the material even was — happened *after* an hour of
orchestration.

Concretely, before endorsing any visual claim:

```bash
# .claude/launch.json 의 portfolio-dev 로 preview 를 띄우고 실제로 본다
node scripts/capture.mjs review/<scope>        # 재캡처 없이는 판정 금지
node scripts/capture-states.mjs review/<scope>
```

Stale screenshots are worse than none. That run nearly judged a page that no
longer existed. **Recapture immediately before every judgement.**

### When a diagnosis is a stop signal, stop

The director wrote "the page is a well-made document, not an authored scene" in
its *first* report. That was the answer. It was approved, written into
instructions — and then the same loop kept running for another hour, treating it
as a category to score rather than a reason to halt.

If a finding invalidates the concept, do not route it to a fix node. Halt the
graph and re-pick the direction. `GOLDEN_FIX` polishes execution; it cannot
rescue a concept. A visual-impact score below ~5 means the concept is wrong, not
that the spacing is wrong.

### Why the graph now requires pixels

`ART_DIRECTION_BRANCH` used to gate on three `.md` files, so `DIRECTION_JUDGE`
picked a direction by reading prose. A direction that only works on paper passed,
and the golden slice scored **2.8 / 9.0** on visual impact — a critic called it
indistinguishable from a reader-mode tech blog.

The path is now:

```
ART_DIRECTION_BRANCH → DIRECTION_RENDER → DIRECTION_JUDGE
```

`DIRECTION_RENDER` requires ≥9 PNGs in `review/directions/` (3 directions × 3
viewports) and ≥3 of them at 320px, because that run's three "structurally
different" candidates turned out **byte-identical on mobile**.
`DIRECTION_JUDGE` cannot advance without those PNGs and must cite
`review/directions/` in its `DECISIONS.md` lock entry.

`scripts/graph.test.mjs` locks this shut. If someone loosens the gate back to
prose, those tests fail. Do not loosen them.

Note that documents did **not** prevent this failure the first time — the full
mandate was in context the whole run. Gates are mechanical; instructions are
only a reminder. Prefer adding a gate over adding a paragraph.

### Handoff

`docs/portfolio/HANDOFF.md` records where the run stopped and the live traps.
Read it before resuming. In particular, `state.json`'s `failedCategories` can be
a stale snapshot — derive the work list from `scorecard.json` scores against
`graph.json`'s current thresholds instead.

Delegate with blocking calls. Background subagents died silently three times in
that run, producing 62 minutes with zero graph transitions.

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