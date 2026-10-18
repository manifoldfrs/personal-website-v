"use client"

import { useEffect } from "react"

export default function ErrorPage({ error, reset }: {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}) {
  useEffect(() => {
    console.error("[page] Rendering failed", error.digest)
  }, [error])

  return (
    <section className="status-page">
      <h1>Something went wrong.</h1>
      <p role="alert">Please try again.</p>
      <button onClick={reset} className="retry-button">Try again</button>
    </section>
  )
}
