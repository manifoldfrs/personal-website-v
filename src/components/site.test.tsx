import { strict as assert } from "node:assert"
import { readFile } from "node:fs/promises"
import { test } from "node:test"
import { renderToStaticMarkup } from "react-dom/server"
import { CreationArtwork } from "@/components/creation-artwork"
import { Footer } from "@/components/footer"
import { PostList } from "@/components/post-list"
import { TransitionLink } from "@/components/transition-link"
import type { PostSummary } from "@/lib/blog"

const post: PostSummary = {
  slug: "feel-dont-think",
  title: "It's just a feeling",
  date: "2025-11-30T04:00:00.000Z",
}

test("writing exposes complete titles, local links and UTC publication dates", () => {
  const html = renderToStaticMarkup(<PostList posts={[post]} />)
  assert.ok(html.includes("It&#x27;s just a feeling"))
  assert.ok(html.includes('href="/blog/feel-dont-think"'))
  assert.ok(html.includes("Nov 30, 2025"))
  assert.ok(html.includes('dateTime="2025-11-30T04:00:00.000Z"'))
})

test("an empty writing list has an explicit message", () => {
  const html = renderToStaticMarkup(<PostList posts={[]} />)
  assert.ok(html.includes("Nothing published yet."))
  assert.ok(!html.includes("<li"))
})

test("document-transition links remain real accessible anchors before hydration", () => {
  const html = renderToStaticMarkup(
    <TransitionLink href="/blog" ariaLabel="View all writing">→</TransitionLink>,
  )

  assert.ok(html.includes('href="/blog"'))
  assert.ok(html.includes('aria-label="View all writing"'))
})

test("artwork is server rendered with descriptive alternative text", () => {
  const html = renderToStaticMarkup(<CreationArtwork />)
  assert.ok(html.includes('src="/images/creation-of-adam.svg"'))
  assert.ok(html.includes("The Creation of Adam"))
})

test("the shipped artwork is self-contained and defaults to a still image", async () => {
  const svg = await readFile("public/images/creation-of-adam.svg", "utf8")
  assert.equal((svg.match(/class="facet"/g) ?? []).length, 630)
  assert.ok(svg.includes("@media(prefers-reduced-motion:no-preference)"))
  assert.ok(!svg.includes("<script"))
  assert.ok(!svg.includes("<image"))
})

test("footer retains social destinations without music or contact controls", () => {
  const html = renderToStaticMarkup(<Footer />)
  assert.ok(html.includes("Faris Habib. All Rights Reserved."))
  assert.ok(html.includes("https://github.com/manifoldfrs"))
  assert.ok(html.includes("https://x.com/frshbb"))
  assert.ok(html.includes("https://linkedin.com/in/farishabib"))
  assert.ok(!html.includes("spotify"))
  assert.ok(!html.includes("/contact"))
})
