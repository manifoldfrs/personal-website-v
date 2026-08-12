import { Effect } from "effect"
import type { Metadata } from "next"
import { PostList } from "@/components/post-list"
import { getAllPosts } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Writing | Faris Habib",
  description: "Writing and reflections from Faris Habib.",
}

export default async function BlogPage() {
  const posts = await Effect.runPromise(
    getAllPosts.pipe(Effect.orElseSucceed(() => [])),
  )

  return (
    <div>
      <h1 className="terminal-command-label"><span aria-hidden="true">$</span> ls -lt ~/writing</h1>
      <div className="terminal-section"><PostList posts={posts} /></div>
    </div>
  )
}
