---
name: motion-system
description: Defines and enforces portfolio motion language and animation ownership.
user-invocable: false
---

# Motion System

Every animated visual property has exactly one owner.

Allowed owners:

GSAP
MOTION
CSS
THREE

GSAP owns:

- scroll choreography
- scrub
- pin
- large timeline transitions

Motion owns:

- layout transitions
- shared elements
- hover
- state changes
- springs

CSS owns:

- inexpensive micro transitions

Three owns:

- explicit 3D scene transforms

Lenis owns scroll transport only.

Never animate one transform from multiple systems.

Define:

- primary easing
- secondary easing
- durations
- scroll response
- depth language
- blur language
- scale language
- typography motion
- image motion
- hover behavior

Prefer controlled spectacle.

Three signature interactions are normally sufficient.