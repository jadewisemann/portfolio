# Portfolio Project

A one-page portfolio site (`/`) plus per-project pages (`/projects/…`), built
with Next.js. There is no agent workflow harness — it was removed on
2026-09-03 (owner instruction). Gates live in the test suite, not in a graph.

## Source of truth

Always read before substantial changes:

- docs/portfolio/ART_DIRECTION.md — visual judgment
- docs/portfolio/DESIGN_SYSTEM.md — tokens, scales, contrast
- docs/portfolio/MOTION_LANGUAGE.md — motion ownership and budget
- docs/portfolio/DECISIONS.md — why things are the way they are

If the three specs disagree, fix ART_DIRECTION.md first, then the others.

The current visual direction is a full palette/typography replacement adopted
from `https://www.aarab.me/` (owner instruction, 2026-09-03). The extraction —
tokens, type scale, structure, and the two effects this repo's gates forbid —
is in `docs/portfolio/REF_AARAB.md`.

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

Facts are extracted from there into docs/portfolio/BRIEF.md and
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
whole brief. Beauty arrives first.

The owner rejected the 2026-08-31 output in one word: **"이력서냐"** (is this a
résumé?). Learn the register it names:

| Résumé register (rejected) | Portfolio register (wanted) |
|---|---|
| One column of text | Designed scenes |
| Facts with evidence grades as footnotes | Facts as part of a scene |
| Explains the work in prose | Shows the work |
| 36px heading, centered band | Typography that dominates the viewport |

### A portfolio shows; it does not explain (owner, 2026-08-31)

Three rounds of candidates were built and rejected before this was written down,
so take it literally:

> 포트폴리오는 내 프로젝트를 설명하는 게 아니야. 그냥 뭘 했는지 미적으로 보여주는
> 거지. 뭘 했는지를 아름답게 설명할 필요가 전혀 없어. 키워드랑 프로젝트 설명이랑
> 스크린샷 같은 것만 두고, 거기서 별도 페이지에서 아키텍처나 코드 리딩을 보고 하는
> 구조야.

**The structure**, and it is not negotiable without the owner:

- **Landing** — keywords, a short project blurb, screenshots, presented
  aesthetically. **The first viewport carries the name and nothing else**
  (owner, same day: 첫 페이지에서는 글자가 거의 없어야 해).
- **Per-project pages** — architecture and code reading live here, reached from
  the landing page. This is where depth goes.

So: **screenshots and keywords on the surface, depth one click away.**

### Two failure modes this repo has actually produced

1. **The document.** Sentences explaining the work, evidence grades as footnotes,
   a centred column of prose. A README wearing a portfolio's clothes.
2. **Rendering the mechanisms.** An earlier version of this file said the
   engineering mechanisms were the visual material — the coverage ratchet, the
   payment FSM, the two-tier cache, drawn as things that operate. It was a detour
   around a constraint that no longer holds: **the owner supplies screenshots.**
   The owner's verdict on that line of work was 과하게 어려운 일을 하려고 노력
   중이었구나. Do not restart it. A mechanism belongs on a project page, in prose
   and diagrams, where someone who clicked through actually wants it.

## Core rules

- Do not invent portfolio facts.
- Search existing components before creating complex visual components.
- Do not mix animation ownership (see below).
- Record every non-obvious decision in `docs/portfolio/DECISIONS.md`.

### The browser is the truth

Never judge visual work from source code or from a spec document. **Open the
page and look at it.**

The 2026-08-31 run failed on exactly this: an hour of relaying text reports —
all of it correct and all of it beside the point. The first screenshot rendered
showed the problem instantly.

```bash
node scripts/capture.mjs review/<scope>
```

Stale screenshots are worse than none. **Recapture immediately before every
judgement.**

`npm run e2e` and `scripts/capture.mjs` run `next build` into the same `.next`
that `next dev` is serving from. Running them while the preview server is up
corrupts the dev server (Turbopack 500s, dead HMR socket, a page that looks
half-broken). Stop the preview first, or restart it afterwards, before judging
anything in the browser.

### Prefer a gate over a paragraph

Documents did not prevent that failure — the full mandate was in context the
whole run. The rules that actually hold are the ones in the test suite:

| Gate | What it locks |
|---|---|
| `src/motion-tokens.test.ts` | MOTION_LANGUAGE.md 3·4절 ↔ `globals.css` token values |
| `src/motion-ownership.test.ts` | no gsap/lenis, no scroll-scrub, no keyframes, no blur, no outward shadow, no `will-change` |
| `src/forbidden-claims.test.ts` | claims the owner's SSOT forbids |
| `e2e/geometry.spec.ts` | hero name does not overflow in any font combination |

When a rule matters, add a test. Do not loosen these to make a design work —
change the design, or change the rule *and* its document together.

## Motion ownership

| Owner | Scope |
|---|---|
| **Motion** (`motion` package) | entry transitions, via `src/components/site/Reveal.tsx` only |
| **CSS** | hover / focus / current-state changes |
| **Three.js / R3F** | explicit 3D scenes only |

GSAP and Lenis are **not** dependencies and must not be re-added —
`src/motion-ownership.test.ts` fails if they are. There is no scroll-scrubbed
property on this site; nothing reads scroll offset per frame.

## Visual sources

Prefer researching these before implementing complex interaction from scratch:

- React Bits · 21st.dev · Aceternity UI · Magic UI · Codrops

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
