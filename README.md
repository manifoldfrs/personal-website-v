# heyfar.is

Faris Habib's personal website, built with Next.js 16 and a Tokyo Night color palette.

## Stack

- Next.js App Router, React 19, and strict TypeScript
- Tailwind CSS v4 and native CSS view transitions
- Georgia for headings and prose, system monospace for navigation and dates
- Markdown posts loaded through the Effect-based `src/lib/blog` API
- A pre-rendered, animated SVG hero and a lossless pixel-art landscape

## Development

```bash
bun install
bun run dev
```

## Validation

```bash
bun run lint
bun x tsc --noEmit
bun test src/components/site.test.tsx
bun run build
```

## Structure

- `src/app`: home, about, writing index, and individual posts
- `src/components`: navigation, footer, artwork, and post presentation
- `src/lib/blog`: markdown parsing, frontmatter validation, and post loading
- `src/content/posts`: published Markdown files
- `public/images`: site and post artwork

The contact form and Spotify callback are no longer public routes. The site does not load the Spotify player.

The hero's facets are precomputed in `public/images/creation-of-adam.svg`; the browser does not need to triangulate the source painting. Its entrance animation runs once and shows a still image when reduced motion is requested.

Internal links retain normal anchor behavior and deliberately use document navigation to enable native cross-document view transitions. Browsers without that feature navigate normally.
