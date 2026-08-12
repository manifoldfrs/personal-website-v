"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="py-8">
      <p className="terminal-command-label"><span aria-hidden="true">$</span> retry last-command</p>
      <p className="font-mono text-5xl text-accent">ERROR</p>
      <p role="alert" className="mt-4 font-mono text-sm text-muted-foreground">Something went wrong.</p>
      <button
        onClick={reset}
        className="mt-6 rounded-md border border-border px-5 py-2.5 font-mono text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
      >
        Try again
      </button>
    </div>
  )
}
