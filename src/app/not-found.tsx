import Link from "next/link"

export default function NotFound() {
  return (
    <div className="py-8">
      <p className="terminal-command-label"><span aria-hidden="true">$</span> open requested-page</p>
      <p className="font-mono text-5xl text-accent">404</p>
      <p className="mt-4 font-mono text-sm text-muted-foreground">error: path does not exist.</p>
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
