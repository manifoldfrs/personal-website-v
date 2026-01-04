import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="font-mono text-8xl font-light text-accent mb-4">
          404
        </h1>
        <p className="font-mono text-sm text-muted-foreground mb-8">
          Page not found
        </p>
        <Link
          href="/"
          className="font-mono text-sm underline underline-offset-4 text-muted-foreground hover:text-accent transition-colors"
        >
          Return home
        </Link>
      </div>
    </div>
  )
}
