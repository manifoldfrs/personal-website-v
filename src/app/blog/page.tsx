import { Effect, Either } from "effect"
import type { Metadata } from "next"
import { PostList } from "@/components/post-list"
import { getAllPosts } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Writing | Faris Habib",
  description: "Writing and reflections from Faris Habib.",
}

export default async function BlogPage() {
  const result = await Effect.runPromise(Effect.either(getAllPosts))

  if (Either.isLeft(result)) console.error("[blog] Could not load writing", result.left._tag)

  return (
    <section className="writing-page">
      <header className="article-header"><h1>Writing</h1></header>
      {Either.isLeft(result) ? (
        <p role="alert" className="empty-writing">Could not load writing.</p>
      ) : <PostList posts={result.right} />}
    </section>
  )
}
