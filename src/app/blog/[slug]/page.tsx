import { cache } from "react"
import { Effect } from "effect"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PostBody } from "@/components/post-body"
import { getAllSlugs, getPostBySlug, PostNotFoundError } from "@/lib/blog"
import type { Post } from "@/lib/blog"

/** Published posts are generated at build time; unknown slugs must return an HTTP 404. */
export const dynamicParams = false

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

          // Let Next.js render the error boundary for non-missing posts.
          throw error
        },
        onSuccess: (post) => post,
      })
    )
  )
})

export async function generateStaticParams() {
  const slugs = await Effect.runPromise(getAllSlugs)

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

  const description = post.excerpt || `Read ${post.title} on heyfar.is`

  // Child openGraph/twitter objects replace the root layout's rather than merging, so restate the shared fields.
  return {
    title: `${post.title} | Faris Habib`,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description,
      url: `/blog/${slug}`,
      siteName: "Faris Habib",
      type: "article",
      publishedTime: post.date,
    },
    twitter: { card: "summary", title: post.title, description },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return <PostBody title={post.title} date={post.date} content={post.content} tags={post.tags} />
}
