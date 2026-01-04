# hbb.dev

Personal website built with Next.js 16, featuring a dark theme with gold accents.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Fonts**: JetBrains Mono + Geist Sans
- **3D**: Three.js with React Three Fiber
- **Animations**: Framer Motion + Lenis smooth scroll
- **Blog**: Markdown with Effect.js service layer
- **Email**: Resend for contact form
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home
│   ├── about/             # About page
│   ├── blog/              # Blog listing + [slug] pages
│   └── contact/           # Contact form + server action
├── components/            # React components
│   ├── hero.tsx           # Hero section with 3D sphere
│   ├── navbar.tsx         # Navigation
│   ├── footer.tsx         # Footer with social links
│   ├── post-list.tsx      # Blog post list
│   ├── post-body.tsx      # Blog post content
│   ├── sentient-sphere.tsx # WebGL animated sphere
│   ├── smooth-scroll.tsx  # Lenis wrapper
│   └── custom-cursor.tsx  # Custom cursor effect
├── lib/
│   └── blog/              # Effect.js blog system
│       ├── types.ts       # TypeScript types
│       ├── slug.ts        # Slug utilities
│       ├── markdown.ts    # Markdown to HTML
│       ├── posts-service.ts # Effect.js service
│       └── index.ts       # Public API
└── content/
    └── posts/             # Markdown blog posts
```

## Development

```bash
# Install dependencies
bun install

# Run dev server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

## Environment Variables

For the contact form to send emails, set:

```
RESEND_API_KEY=your_resend_api_key
```

