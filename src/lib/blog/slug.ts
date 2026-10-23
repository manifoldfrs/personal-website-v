/**
 * Slug derivation from filenames
 *
 * Example: neo-sparta.md -> neo-sparta
 */

export function deriveSlugFromFilename(filename: string): string {
  return filename.replace(/\.md$/, "")
}
