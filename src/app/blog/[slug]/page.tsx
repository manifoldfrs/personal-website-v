import { cache } from "react"
import { Effect } from "effect"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SmoothScroll } from "@/components/smooth-scroll"
import { CustomCursor } from "@/components/custom-cursor"
import { PostBody } from "@/components/post-body"
import { getAllSlugs, getPostBySlug, PostNotFoundError } from "@/lib/blog"
import type { Post } from "@/lib/blog"

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * Cached post fetcher to deduplicate requests between generateMetadata and page component
 * React's cache() ensures the same request is only made once per render
 */
const getPost = cache(async (slug: string): Promise<Post | null> => {
  return Effect.runPromise(
    getPostBySlug(slug).pipe(
      Effect.match({
        onFailure: (error) => {
          if (error instanceof PostNotFoundError) {
            return null
          }
          // Re-throw other errors to be caught by error boundary
          throw error
        },
        onSuccess: (post) => post,
      })
    )
  )
})

export async function generateStaticParams() {
  const slugs = await Effect.runPromise(
    getAllSlugs.pipe(Effect.orElseSucceed(() => []))
  )
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return {
      title: "Post Not Found | Faris Habib",
      description: "The requested post could not be found.",
    }
  }

  return {
    title: `${post.title} | Faris Habib`,
    description: post.excerpt || `Read ${post.title} on hbb.dev`,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <SmoothScroll>
      <CustomCursor />
      <Navbar />
      <main>
        <PostBody
          title={post.title}
          date={post.date}
          content={post.content}
          tags={post.tags}
        />
      </main>
      <Footer />
    </SmoothScroll>
  )
}
