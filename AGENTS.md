# AGENTS.md (root)

## Project Snapshot
- Repo type: single Next.js application (no workspaces).
- Stack: Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS v4, Effect.js.
- Blog posts live in `src/content/posts` and are parsed via `src/lib/blog`.
- Subdirectories have their own AGENTS.md; read the closest file first.

## Root Setup Commands
- Install dependencies: `bun install`
- Dev server: `bun run dev`
- Build: `bun run build`
- Start (prod): `bun run start`
- Typecheck: `bun x tsc --noEmit`
- Lint (only automated check): `bun run lint`

## Universal Conventions
- TypeScript strict mode and `@/` path alias (`tsconfig.json`).
- App Router server components by default; add `"use client"` for hooks/animations.
- Use double quotes and no semicolons to match existing style.
- Tailwind v4 via `@tailwindcss/postcss`; tokens in `src/app/globals.css`.
- Prefer named exports and kebab-case filenames for components.

## Security & Secrets
- Secrets go in `.env.local` (e.g., `RESEND_API_KEY`).
- Never commit `.env*` files or API keys.
- Avoid logging form submissions or user PII outside local debugging.

## JIT Index (what to open, not what to paste)

### Package Structure
- App Router routes: `src/app/` → `src/app/AGENTS.md`
- UI components: `src/components/` → `src/components/AGENTS.md`
- Blog + utilities: `src/lib/` → `src/lib/AGENTS.md`
- Markdown posts: `src/content/` → `src/content/AGENTS.md`
- Static assets: `public/images/`

### Quick Find Commands
- Find a route page: `rg -n "export default" src/app`
- Find server actions: `rg -n "\"use server\"" src/app`
- Find a component: `rg -n "export function" src/components`
- Find blog data usage: `rg -n "getAllPosts|getPostBySlug|Effect.runPromise" src`
- Find a post by title: `rg -n "^title:" src/content/posts`

## Definition of Done
- `bun run lint` passes (no dedicated test runner).
- `bun x tsc --noEmit` passes.
- `bun run build` succeeds.
- Content/routes updated and no secrets added.
