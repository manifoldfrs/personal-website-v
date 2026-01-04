/**
 * Effect.js service for loading and managing blog posts
 * Uses @effect/platform-node for file system operations
 */

import { Effect, Data, Duration } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import path from "node:path"
import matter from "gray-matter"
import { z } from "zod"
import type { Post, PostSummary } from "./types"
import { deriveSlugFromFilename } from "./slug"
import { markdownToHtml, extractExcerpt } from "./markdown"

/**
 * Zod schema for validating frontmatter at runtime
 */
const frontmatterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  excerpt: z.string().optional(),
  layout: z.string().optional(),
})

// Error types
export class PostNotFoundError extends Data.TaggedError("PostNotFoundError")<{
  slug: string
}> {}

export class ParseError extends Data.TaggedError("ParseError")<{
  cause: unknown
  filename?: string
}> {}

export class FileSystemError extends Data.TaggedError("FileSystemError")<{
  cause: unknown
  path: string
}> {}

// Posts directory
const POSTS_DIR = path.join(process.cwd(), "src/content/posts")

/**
 * Get all markdown files from the posts directory using Effect FileSystem
 */
const getPostFiles: Effect.Effect<
  ReadonlyArray<string>,
  FileSystemError,
  FileSystem.FileSystem
> = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem

  const exists = yield* fs.exists(POSTS_DIR).pipe(
    Effect.catchAll(() => Effect.succeed(false))
  )

  if (!exists) {
    return []
  }

  const entries = yield* fs.readDirectory(POSTS_DIR).pipe(
    Effect.catchAll((error) =>
      Effect.fail(new FileSystemError({ cause: error, path: POSTS_DIR }))
    )
  )

  return entries
    .filter((file) => file.endsWith(".md"))
    .sort()
    .reverse() // Most recent first
})

/**
 * Parse a single post file using Effect FileSystem
 */
const parsePostFile = (
  filename: string
): Effect.Effect<Post, ParseError | FileSystemError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const filePath = path.join(POSTS_DIR, filename)

    const fileContent = yield* fs.readFileString(filePath, "utf8").pipe(
      Effect.catchAll((error) =>
        Effect.fail(new FileSystemError({ cause: error, path: filePath }))
      )
    )

    const parsed = yield* Effect.try({
      try: () => matter(fileContent),
      catch: (error) => new ParseError({ cause: error, filename }),
    })
    const { data, content } = parsed

    // Validate frontmatter with Zod
    const parseResult = frontmatterSchema.safeParse(data)
    if (!parseResult.success) {
      return yield* Effect.fail(
        new ParseError({
          cause: parseResult.error,
          filename,
        })
      )
    }

    const frontmatter = parseResult.data
    const slug = deriveSlugFromFilename(filename)
    const htmlContent = yield* Effect.promise(() => markdownToHtml(content))

    // Extract categories as tags if tags not provided
    const tags = frontmatter.tags ?? frontmatter.categories ?? []

    return {
      slug,
      title: frontmatter.title,
      date: frontmatter.date
        ? new Date(frontmatter.date).toISOString()
        : new Date().toISOString(),
      excerpt: frontmatter.excerpt ?? extractExcerpt(content),
      tags: tags.filter((t) => t.toLowerCase() !== "posts"), // Filter out "Posts" category
      content: htmlContent,
      rawContent: content,
    } satisfies Post
  })

/**
 * Internal: Get all posts with FileSystem dependency
 */
const getAllPostsInternal: Effect.Effect<
  ReadonlyArray<PostSummary>,
  ParseError | FileSystemError,
  FileSystem.FileSystem
> = Effect.gen(function* () {
  const files = yield* getPostFiles

  const posts = yield* Effect.all(
    files.map((file) =>
      parsePostFile(file).pipe(
        Effect.map(
          ({ slug, title, date, excerpt, tags }): PostSummary => ({
            slug,
            title,
            date,
            excerpt,
            tags,
          })
        )
      )
    ),
    { concurrency: "unbounded" }
  )

  // Check for duplicate slugs and warn
  const slugCounts = new Map<string, number>()
  for (const post of posts) {
    slugCounts.set(post.slug, (slugCounts.get(post.slug) ?? 0) + 1)
  }
  const duplicates = [...slugCounts.entries()].filter(([, count]) => count > 1)
  if (duplicates.length > 0) {
    console.warn(
      `[blog] Duplicate slugs found: ${duplicates.map(([slug]) => slug).join(", ")}`
    )
  }

  return posts
})

/**
 * Internal: Get a single post by slug with FileSystem dependency
 */
const getPostBySlugInternal = (
  slug: string
): Effect.Effect<
  Post,
  PostNotFoundError | ParseError | FileSystemError,
  FileSystem.FileSystem
> =>
  Effect.gen(function* () {
    const files = yield* getPostFiles

    const matchingFile = files.find((file) => {
      const fileSlug = deriveSlugFromFilename(file)
      return fileSlug === slug
    })

    if (!matchingFile) {
      return yield* Effect.fail(new PostNotFoundError({ slug }))
    }

    return yield* parsePostFile(matchingFile)
  })

/**
 * Internal: Get all post slugs with FileSystem dependency
 */
const getAllSlugsInternal: Effect.Effect<
  ReadonlyArray<string>,
  FileSystemError,
  FileSystem.FileSystem
> = Effect.gen(function* () {
  const files = yield* getPostFiles
  return files.map(deriveSlugFromFilename)
})

/**
 * Provide NodeFileSystem layer to an effect
 */
const withFileSystem = <A, E>(
  effect: Effect.Effect<A, E, FileSystem.FileSystem>
): Effect.Effect<A, E> => Effect.provide(effect, NodeFileSystem.layer)

/**
 * Get all posts as summaries (for listing)
 * Cached with 30 second TTL
 */
export const getAllPosts: Effect.Effect<
  ReadonlyArray<PostSummary>,
  ParseError | FileSystemError
> = withFileSystem(getAllPostsInternal)

/**
 * Cached version of getAllPosts with 30s TTL
 */
export const getAllPostsCached = Effect.cachedWithTTL(
  getAllPosts,
  Duration.seconds(30)
)

/**
 * Get a single post by slug
 */
export const getPostBySlug = (
  slug: string
): Effect.Effect<Post, PostNotFoundError | ParseError | FileSystemError> =>
  withFileSystem(getPostBySlugInternal(slug))

/**
 * Get all post slugs (for static generation)
 */
export const getAllSlugs: Effect.Effect<
  ReadonlyArray<string>,
  FileSystemError
> = withFileSystem(getAllSlugsInternal)
