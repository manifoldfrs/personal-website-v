import { TransitionLink } from "@/components/transition-link"
import type { PostSummary } from "@/lib/blog"
import { formatDate } from "@/lib/utils"

interface PostListProps {
  readonly posts: readonly PostSummary[]
}

/** Displays complete post titles and stable publication dates in their supplied order. */
export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <p className="empty-writing">Nothing published yet.</p>
  }

  return (
    <ul className="post-list">
      {posts.map((post) => (
        <li key={post.slug}>
          <TransitionLink href={`/blog/${post.slug}`} className="post-link">
            <span className="post-title"><span className="post-title-text">{post.title}</span></span>
            <time dateTime={post.date} className="post-date">{formatDate(post.date, "short")}</time>
          </TransitionLink>
        </li>
      ))}
    </ul>
  )
}
