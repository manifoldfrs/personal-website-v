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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="font-mono text-8xl font-light text-muted-foreground mb-4">
          :(
        </h1>
        <p className="font-mono text-sm text-muted-foreground mb-8">
          Something went wrong
        </p>
        <button
          onClick={reset}
          className="font-mono text-sm px-6 py-3 border border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors rounded"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
