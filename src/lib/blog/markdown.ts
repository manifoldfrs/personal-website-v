/**
 * Markdown to HTML rendering with remark/rehype
 */

import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"
import rehypeRaw from "rehype-raw"

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(markdown)

  return String(result)
}

/**
 * Extract first paragraph as excerpt if not provided
 */
export function extractExcerpt(markdown: string, maxLength = 160): string {
  // Remove frontmatter if present
  const content = markdown.replace(/^---[\s\S]*?---/, "").trim()
  
  // Get first paragraph
  const paragraphs = content.split(/\n\n/)
  const first = paragraphs[0] ?? ""
  const firstParagraph = first
    .replace(/[#*_`\[\]]/g, "") // Remove markdown syntax
    .replace(/\n/g, " ")
    .trim()

  if (firstParagraph.length <= maxLength) {
    return firstParagraph
  }

  return firstParagraph.slice(0, maxLength).replace(/\s+\S*$/, "") + "..."
}
