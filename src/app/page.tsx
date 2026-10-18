import { Effect, Either } from "effect"
import { CreationArtwork } from "@/components/creation-artwork"
import { PostList } from "@/components/post-list"
import { TransitionLink } from "@/components/transition-link"
import { getAllPosts } from "@/lib/blog"

export default async function HomePage() {
  const result = await Effect.runPromise(Effect.either(getAllPosts))

  if (Either.isLeft(result)) console.error("[blog] Could not load home writing", result.left._tag)

  return (
    <>
      <CreationArtwork />
      <section className="home-intro">
        <h1>The adventures <span className="title-accent">continue</span></h1>
      </section>
      <section className="home-writing" aria-label="Writing">
        {Either.isLeft(result) ? (
          <p role="alert" className="empty-writing">Could not load writing.</p>
        ) : (
          <>
            <PostList posts={result.right.slice(0, 5)} />
            {result.right.length > 5 && (
              <TransitionLink href="/blog" className="more-writing" ariaLabel="View all writing">
                <svg width="32" height="24" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 12h23M19 4l8 8-8 8" />
                </svg>
              </TransitionLink>
            )}
          </>
        )}
      </section>
    </>
  )
}
