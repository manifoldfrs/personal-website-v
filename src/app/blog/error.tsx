"use client"

import { useEffect } from "react"

export default function WritingError({ error, reset }: {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}) {
  useEffect(() => {
    console.error("[blog] Rendering failed", error.digest)
  }, [error])

  return (
    <section className="status-page">
      <h1>Could not load writing.</h1>
      <button onClick={reset} className="retry-button">Try again</button>
    </section>
  )
}
