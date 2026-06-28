import Link from "next/link"
import { Effect } from "effect"
import { PostList } from "@/components/post-list"
import { getAllPosts } from "@/lib/blog"

export default async function HomePage() {
  const posts = await Effect.runPromise(
    getAllPosts.pipe(Effect.orElseSucceed(() => [])),
  )
  const latestPosts = posts.slice(0, 5)

  return (
    <div>
      <h1 className="sr-only">
        Faris Habib — Software Engineer
      </h1>

      <div className="prose mb-16">🤘</div>

      <section>
        <h2 className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Recent writing
        </h2>
        <PostList posts={latestPosts} />
        {posts.length > latestPosts.length && (
          <Link
            href="/blog"
            className="mt-6 inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            All writing
            <span aria-hidden="true">
              →
            </span>
          </Link>
        )}
      </section>
    </div>
  )
}
