import { Suspense } from "react"
import { Effect } from "effect"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SmoothScroll } from "@/components/smooth-scroll"
import { CustomCursor } from "@/components/custom-cursor"
import { PostList } from "@/components/post-list"
import { getAllPosts } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Blog | Faris Habib",
}

/**
 * Loading skeleton for the full blog post list
 */
function BlogPostsSkeleton() {
  return (
    <section className="relative py-32 px-8 md:px-12 md:py-24">
      <div className="animate-pulse space-y-8">
        <div className="mb-24">
          <div className="h-3 w-24 bg-secondary rounded mb-4" />
          <div className="h-10 w-64 bg-secondary rounded" />
        </div>
        {[...Array(10)].map((_, i) => (
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
 * Async component for fetching and displaying all posts
 */
async function AllPosts() {
  const posts = await Effect.runPromise(
    getAllPosts.pipe(Effect.orElseSucceed(() => []))
  )

  return <PostList posts={posts} showHeader={true} />
}

export default function BlogPage() {
  return (
    <SmoothScroll>
      <CustomCursor />
      <Navbar />
      <main className="min-h-screen pt-32">
        <Suspense fallback={<BlogPostsSkeleton />}>
          <AllPosts />
        </Suspense>
      </main>
      <Footer />
    </SmoothScroll>
  )
}
