/**
 * Slug derivation from filenames
 * 
 * Expected filename format: YYYY-MM-DD-slug-name.md
 * Example: 2024-01-28-neo-sparta.md -> neo-sparta
 */

export function deriveSlugFromFilename(filename: string): string {
  // Remove .md extension
  const withoutExt = filename.replace(/\.md$/, "")
  
  // Remove date prefix (YYYY-MM-DD-)
  const withoutDate = withoutExt.replace(/^\d{4}-\d{2}-\d{2}-/, "")
  
  return withoutDate
}

export function deriveDateFromFilename(filename: string): string | null {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})/)
  return match?.[1] ?? null
}
