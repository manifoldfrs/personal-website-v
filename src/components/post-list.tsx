import Link from "next/link"
import type { PostSummary } from "@/lib/blog"

interface PostListProps {
  posts: readonly PostSummary[]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <p className="font-serif text-muted-foreground">Nothing published yet. Check back soon.</p>
  }

  return (
    <ul className="divide-y divide-border border-b border-border">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={`/blog/${post.slug}`}
            className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
          >
            <span className="font-sans text-lg leading-snug text-foreground transition-colors group-hover:text-accent">
              {post.title}
            </span>
            <time
              dateTime={post.date}
              className="shrink-0 font-mono text-xs tracking-wide text-muted-foreground"
            >
              {formatDate(post.date)}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  )
}
