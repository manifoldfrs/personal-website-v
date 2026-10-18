import { TransitionLink } from "@/components/transition-link"
import { formatDate } from "@/lib/utils"

interface PostBodyProps {
  readonly title: string
  readonly date: string
  readonly content: string
  readonly tags?: readonly string[]
}

/** Renders HTML from the trusted repository markdown pipeline. */
export function PostBody({ title, date, content, tags }: PostBodyProps) {
  return (
    <article className="article-page">
      <header className="article-header">
        <time dateTime={date} className="article-date">{formatDate(date)}</time>
        <h1>{title}</h1>
        {tags && tags.length > 0 && (
          <ul className="post-tags" aria-label="Tags">
            {tags.map((tag) => <li key={tag}>#{tag}</li>)}
          </ul>
        )}
      </header>
      <div className="prose" dangerouslySetInnerHTML={{ __html: content }} />
      <div className="article-back">
        <TransitionLink href="/blog"><span aria-hidden="true">← </span>All writing</TransitionLink>
      </div>
    </article>
  )
}
