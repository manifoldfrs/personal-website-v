# AGENTS.md (src/components)

## Package Identity
- Reusable UI and animation components for the site.
- Mostly client components using Framer Motion, React Three Fiber, and Lenis.

## Setup & Run
- `bun run dev`
- `bun run build`
- `bun run start`
- `bun run lint`
- `bun x tsc --noEmit`

## Patterns & Conventions
- ✅ DO: Keep component filenames kebab-case, e.g., `src/components/post-list.tsx`.
- ✅ DO: Use named exports like `export function Navbar` in `src/components/navbar.tsx`.
- ✅ DO: Add `"use client"` for hooks/animations (see `src/components/hero.tsx`).
- ✅ DO: Use Framer Motion for animations (e.g., `src/components/post-list.tsx`).
- ✅ DO: Use `next/link` for internal navigation (see `src/components/navbar.tsx`).
- ✅ DO: Tag cursor targets with `data-cursor-hover` (see `src/components/post-list.tsx`, `src/components/footer.tsx`).
- ✅ DO: Load heavy 3D content via `next/dynamic` with `ssr: false` (`src/components/hero.tsx`).
- ✅ DO: Keep WebGL logic isolated in `src/components/sentient-sphere.tsx`.
- ✅ DO: Use Tailwind theme tokens from `globals.css` (`text-muted-foreground`, `bg-background`) like `src/components/footer.tsx`.
- ❌ DON'T: Use `dangerouslySetInnerHTML` unless rendering markdown like `src/components/post-body.tsx`.
- ❌ DON'T: Inline R3F `Canvas` in multiple components; centralize it in `src/components/sentient-sphere.tsx`.

## Touch Points / Key Files
- Hero + 3D background: `src/components/hero.tsx`
- WebGL sphere: `src/components/sentient-sphere.tsx`
- Navigation: `src/components/navbar.tsx`
- Footer: `src/components/footer.tsx`
- Blog list: `src/components/post-list.tsx`
- Blog content renderer: `src/components/post-body.tsx`
- Smooth scrolling wrapper: `src/components/smooth-scroll.tsx`
- Custom cursor: `src/components/custom-cursor.tsx`

## JIT Index Hints
- Find components: `rg -n "export function" src/components`
- Find client components: `rg -n "\"use client\"" src/components`
- Find motion usage: `rg -n "motion\\." src/components`
- Find cursor targets: `rg -n "data-cursor-hover" src/components`
- Find dynamic imports: `rg -n "dynamic\\(" src/components`

## Common Gotchas
- The custom cursor only reacts to `data-cursor-hover` elements.
- `SentientSphere` must stay client-only and loaded with `ssr: false`.
- `SmoothScroll` should wrap the page once (see `src/app/page.tsx`).

## Pre-PR Checks
- `bun run lint && bun x tsc --noEmit && bun run build`
