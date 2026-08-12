import Link from "next/link"
import type { PostSummary } from "@/lib/blog"
import { formatDate } from "@/lib/utils"

interface PostListProps {
  posts: readonly PostSummary[]
}

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <p className="font-mono text-sm text-muted-foreground">total 0 — nothing published yet.</p>
  }

  return (
    <ul className="terminal-post-list">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={`/blog/${post.slug}`}
            className="group grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8"
          >
            <span className="font-mono text-base leading-snug text-foreground transition-colors group-hover:text-accent">
              {post.title}
            </span>
            <time
              dateTime={post.date}
              className="shrink-0 font-mono text-xs tracking-wide text-muted-foreground"
            >
              {formatDate(post.date, "short")}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  )
}
