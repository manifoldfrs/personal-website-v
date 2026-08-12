import Link from "next/link"
import { Effect } from "effect"
import { PostList } from "@/components/post-list"
import { getAllPosts } from "@/lib/blog"

const nameArt = String.raw`#####  .###.  ####.  #####  .####    #...#  .###.  ####.  #####  ####.
#....  #...#  #...#  ..#..  #....    #...#  #...#  #...#  ..#..  #...#
####.  #####  ####.  ..#..  .###.    #####  #####  ####.  ..#..  ####.
#....  #...#  #.#..  ..#..  ....#    #...#  #...#  #...#  ..#..  #...#
#....  #...#  #..##  #####  ####.    #...#  #...#  ####.  #####  ####.`

export default async function HomePage() {
  const posts = await Effect.runPromise(
    getAllPosts.pipe(Effect.orElseSucceed(() => [])),
  )
  const latestPosts = posts.slice(0, 5)

  return (
    <div>
      <h1 className="sr-only">Faris Habib — Software Engineer</h1>
      <pre className="terminal-name-art" aria-hidden="true">{nameArt}</pre>
      <div className="terminal-ascii-fallback" aria-hidden="true">FARIS HABIB</div>

      <section className="terminal-section">
        <p className="terminal-command-label"><span aria-hidden="true">$</span> whoami</p>
        <p className="text-lg" aria-label="Rock on">🤘</p>
      </section>

      <section className="terminal-section">
        <h2 className="terminal-command-label"><span aria-hidden="true">$</span> ls -lt ~/writing | head -5</h2>
        <PostList posts={latestPosts} />
        {posts.length > latestPosts.length && (
          <Link href="/blog" className="terminal-more-link">view all writing →</Link>
        )}
      </section>
    </div>
  )
}
