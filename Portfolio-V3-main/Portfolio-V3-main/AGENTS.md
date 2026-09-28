# Petar Volic — portfolio

Single-page personal portfolio. Two sections only: a full-viewport **hero** with an
animated ASCII canvas, and a full-width **About** section (Education / Skills / Interests).
There is deliberately no nav, no projects section, and no contact/footer — they were
removed on request. Don't reintroduce them unless asked.

## Stack

- React 19 + TypeScript, built with Vite 8.
- **No CSS framework.** Tailwind was installed by the original Figma Make scaffold but
  every class in the project is hand-written, so it was removed. All styling lives in
  `src/index.css` as plain CSS with custom properties. Don't add Tailwind back.
- `lenis` (smooth scroll), `gsap` + ScrollTrigger (animation), `lucide-react` (icons).
- Package manager is **pnpm** (`pnpm-lock.yaml` is authoritative; CI runs
  `pnpm install --frozen-lockfile`). Don't run `npm install` — it creates a competing
  lockfile and CI drifts.

```bash
pnpm install          # or: npx pnpm install
npm run dev           # http://localhost:8443  (strictPort — fails if taken)
npm run build         # -> dist/
npx tsc --noEmit      # type check
```

Deploys to GitHub Pages from `main` via `.github/workflows/deploy.yml`.
`vite.config.ts` sets `base: './'`, so all asset paths must go through
``const asset = p => `${import.meta.env.BASE_URL}${p}` `` — never hardcode a leading `/`.

## Files

| File | Role |
|---|---|
| `src/App.tsx` | The whole page. Hero, ASCII canvas, custom cursor, About section. |
| `src/data/content.ts` | **All copy and data.** Edit here, not in JSX. |
| `src/icons.ts` | Icon registry: string key → lucide component, plus shared size/stroke. |
| `src/lib/motion.ts` | Lenis + GSAP/ScrollTrigger setup. The only animation entry point. |
| `src/index.css` | All styling: tokens, layout, components, responsive, reduced-motion. |
| `index.html` | Shell. Font `<link>`s and meta live here. |
| `public/images/` | `profile-{96,192,288}.{avif,webp}` + a `.jpg` fallback. |
| `assets/` | **Dead.** Stale Figma Make bundle, nothing references it. Kept only because it's the last copy of the original pre-edit source. |

## Content model

Everything renders from `src/data/content.ts` — `profile`, `hero`, `education`, `skills`,
`interests`. Icons are referenced **by string key** (`icon: 'zap'`), resolved through
`ICONS` in `src/icons.ts`, so the data file stays free of imports and is safe for a
non-developer to edit. To add an icon: add a named import + a registry entry, then use
the key. Never `import * from 'lucide-react'` — it defeats tree-shaking.

## Motion

`initMotion(root)` is called once from a `useLayoutEffect` in `App.tsx` and returns a
cleanup function. Markup opts in via attributes:

- `data-split` — heading is split into per-word spans and staggered up.
- `data-animate="fade-up"` — element fades in and slides up.
- `data-animate="stagger"` — direct children stagger in.

Rules that matter:

- **One rAF loop.** Lenis is driven from `gsap.ticker` (`lenis.raf(time * 1000)`) with
  `gsap.ticker.lagSmoothing(0)`, and `ScrollTrigger.update` is bound to Lenis's scroll
  event. Don't add another `requestAnimationFrame` loop.
- **Only animate `transform` and `opacity`.** No width/height/top/left/filter.
- `prefers-reduced-motion` disables Lenis entirely and leaves all content visible.
- `setFrom()` clears leftover transforms before setting a start state. This is load-bearing:
  React StrictMode mounts effects twice, and without it GSAP bakes the previous percentage
  offset in as pixels, so `yPercent → 0` never returns to zero and split headings end up
  invisible below their `overflow:hidden` box.

## ASCII canvas — performance critical

This was a 3,020 ms total-blocking-time problem before it was optimized. Lighthouse went
**59 → 99** after. Preserve all four properties:

1. Alpha is a pure function of the character bucket, so the 33 `rgba()` strings are
   precomputed once (`BUCKET_STYLES`) instead of built per cell per frame.
2. Cells are batched per bucket — ~33 `fillStyle` writes per frame instead of ~16,500.
3. Capped to 30fps.
4. An `IntersectionObserver` plus `visibilitychange` stop the loop entirely when the hero
   is off-screen or the tab is hidden. Verified: ~748k `fillText` calls in 2s while
   visible, **0** when scrolled past.

## Design system

Background `#080808`, text `#f0f0f0` at opacity steps (.8/.52/.36/.3/.26), hairlines
`rgba(240,240,240,.07)`, accent green `#4ade80`. Fonts: Barlow Condensed 700 (hero),
Outfit 300–600 (body/headings), JetBrains Mono 400 (dates, eyebrows). Only the weights
actually used are requested in `index.html`.

Skill pills are the CV's near-black-on-white inverted for the dark page: `#ededed`
background, `#0d0d0d` text, `border-radius: 9999px`, 13px, `6px 14px`.

Layout: About is one full-width section — an intro row (photo · bio · availability)
above three columns (Education | Skills | Interests, Skills widest at 1.6fr) separated by
full-height vertical rules. At ≤1100px the columns stack and the rules become horizontal.

## Open TODOs

`src/data/content.ts` → `interests` has 4 placeholder entries (`TODO: add interest`)
awaiting real content. Available icon keys: `compass`, `music`, `camera`, `game`, `book`,
`dumbbell`.

## House rules

- Don't invent biographical content. Everything in `content.ts` came from a real CV;
  if something is missing, leave a clearly marked `TODO:` rather than filling it in.
- Date of birth and phone numbers are deliberately **not** on the site. Contact is email
  (the "Get in touch" button) only.
