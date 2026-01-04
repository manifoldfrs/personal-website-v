/**
 * Blog post types for the Effect.js blog system
 */

export interface PostFrontmatter {
  title: string
  date: string
  categories?: string[]
  tags?: string[]
  excerpt?: string
  layout?: string
}

export interface PostSummary {
  slug: string
  title: string
  date: string
  excerpt?: string
  tags?: string[]
}

export interface Post extends PostSummary {
  content: string // HTML content
  rawContent: string // Original markdown
}
