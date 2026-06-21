import Link from "next/link"

export default function NotFound() {
  return (
    <div className="py-8">
      <p className="display text-5xl text-accent">404</p>
      <p className="mt-4 font-serif text-lg text-muted-foreground">This page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-accent"
      >
        <span aria-hidden="true">←</span>
        Back home
      </Link>
    </div>
  )
}
