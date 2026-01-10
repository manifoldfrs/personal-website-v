# AGENTS.md (src/content)

## Package Identity
- Markdown posts that power the blog.
- Parsed by the Effect blog service in `src/lib/blog/posts-service.ts`.

## Setup & Run
- `bun run dev`
- `bun run build`
- `bun run lint`

## Patterns & Conventions
- ✅ DO: Keep posts under `src/content/posts/` like `src/content/posts/2025-05-18-interlude.md`.
- ✅ DO: Use filename format `YYYY-MM-DD-slug.md` (see `src/content/posts/2024-01-28-neo-sparta.md`).
- ✅ DO: Include frontmatter fields `layout`, `title`, `date`, `categories` (see `src/content/posts/2025-05-18-interlude.md`).
- ✅ DO: Structure long posts with headings like `src/content/posts/2024-01-28-neo-sparta.md`.
- ✅ DO: Reference images from `public/images` with `/images/...` paths (see `src/content/posts/2025-05-18-interlude.md`).
- ❌ DON'T: Remove the date prefix in filenames; slug derivation expects `YYYY-MM-DD-` per `src/lib/blog/slug.ts`.
- ❌ DON'T: Omit `title` or `date` in frontmatter; validation happens in `src/lib/blog/posts-service.ts`.

## Touch Points / Key Files
- Posts directory: `src/content/posts/`
- Post example: `src/content/posts/2025-05-18-interlude.md`
- Long-form example: `src/content/posts/2024-01-28-neo-sparta.md`
- Slug rules: `src/lib/blog/slug.ts`
- Frontmatter validation: `src/lib/blog/posts-service.ts`

## JIT Index Hints
- Find frontmatter blocks: `rg -n "^---" src/content/posts`
- Find titles: `rg -n "^title:" src/content/posts`
- Find dates: `rg -n "^date:" src/content/posts`
- Find images: `rg -n "/images/" src/content/posts`
- Find categories: `rg -n "^categories:" src/content/posts`

## Common Gotchas
- Missing `title` or `date` will throw during parsing.
- File name date prefix is used for slugs and ordering.

## Pre-PR Checks
- `bun run lint && bun run build`
