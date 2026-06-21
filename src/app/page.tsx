import Link from "next/link"
import { Effect } from "effect"
import { PostList } from "@/components/post-list"
import { getAllPosts } from "@/lib/blog"

export default async function HomePage() {
  const posts = await Effect.runPromise(getAllPosts.pipe(Effect.orElseSucceed(() => [])))
  const latestPosts = posts.slice(0, 5)

  return (
    <div>
      <h1 className="sr-only">Faris Habib — Software Engineer</h1>

      <div className="prose mb-16">
        <p>
          I&apos;m a software engineer. I work on commerce infrastructure at{" "}
          <a href="https://www.coinbase.com" target="_blank" rel="noopener noreferrer">
            Coinbase
          </a>{" "}
          and I&apos;m CTO of Opto AI.
        </p>
        <p>
          I write here about programming, health, faith, and practical philosophy. The most
          interesting ideas tend to show up where those threads cross. I also contribute to{" "}
          <a href="https://x402.org" target="_blank" rel="noopener noreferrer">
            x402
          </a>
          , an open protocol for payments on the web.
        </p>
        <p>
          You can find me on{" "}
          <a href="https://github.com/manifoldfrs" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>{" "}
          and{" "}
          <a href="https://x.com/frshbb" target="_blank" rel="noopener noreferrer">
            X
          </a>
          , or get in touch on the <Link href="/contact">contact</Link> page.
        </p>
      </div>

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
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </section>
    </div>
  )
}
