import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface PostBodyProps {
  title: string
  date: string
  content: string
  tags?: string[]
}

export function PostBody({ title, date, content, tags }: PostBodyProps) {
  return (
    <article>
      <header className="mb-10">
        <time dateTime={date} className="font-mono text-xs tracking-wide text-muted-foreground">
          {formatDate(date)}
        </time>
        <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-primary md:text-4xl">
          {title}
        </h1>
        {tags && tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
            {tags.map((tag) => (
              <span key={tag} className="font-mono text-xs text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose" dangerouslySetInnerHTML={{ __html: content }} />

      <div className="mt-14 border-t border-border pt-6">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-accent"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          All writing
        </Link>
      </div>
    </article>
  )
}
