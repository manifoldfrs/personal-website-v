import { Suspense } from "react"
import { Effect } from "effect"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { SectionBlend } from "@/components/section-blend"
import { PostList } from "@/components/post-list"
import { Footer } from "@/components/footer"
import { SmoothScroll } from "@/components/smooth-scroll"
import { CustomCursor } from "@/components/custom-cursor"
import { getAllPosts } from "@/lib/blog"

/**
 * Loading skeleton for the post list section
 */
function PostListSkeleton() {
  return (
    <section className="relative py-32 px-8 md:px-12 md:py-24">
      <div className="animate-pulse space-y-8">
        <div className="mb-24">
          <div className="h-3 w-24 bg-secondary rounded mb-4" />
          <div className="h-10 w-64 bg-secondary rounded" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-t border-white/10 py-8">
            <div className="h-4 w-24 bg-secondary rounded mb-4" />
            <div className="h-8 w-3/4 bg-secondary rounded" />
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * Async component for fetching and displaying latest posts
 */
async function LatestPosts() {
  const posts = await Effect.runPromise(
    getAllPosts.pipe(Effect.orElseSucceed(() => []))
  )
  const latestPosts = posts.slice(0, 5)

  return <PostList posts={latestPosts} />
}

export default function HomePage() {
  return (
    <SmoothScroll>
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <SectionBlend />
        <Suspense fallback={<PostListSkeleton />}>
          <LatestPosts />
        </Suspense>
      </main>
      <Footer />
    </SmoothScroll>
  )
}
