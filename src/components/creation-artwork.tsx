"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"

/** Replays the SVG on restored home pages as well as normal navigation and refresh. */
export function CreationArtwork() {
  const artworkRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const replayRestoredArtwork = (event: PageTransitionEvent) => {
      if (!event.persisted || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

      const artwork = artworkRef.current

      if (!artwork) return

      // A restored SVG needs a fresh image timeline, not the cached finished animation.
      const artworkUrl = new URL(artwork.src)
      artworkUrl.searchParams.set("replay", crypto.randomUUID())
      artwork.src = artworkUrl.href
    }

    window.addEventListener("pageshow", replayRestoredArtwork)

    return () => window.removeEventListener("pageshow", replayRestoredArtwork)
  }, [])

  return (
    <figure className="creation-artwork">
      <Image
        ref={artworkRef}
        src="/images/creation-of-adam.svg"
        alt="The reaching hands from Michelangelo's The Creation of Adam, rendered in blue facets"
        width={1800}
        height={600}
        className="creation-artwork-image"
        preload
        unoptimized
      />
    </figure>
  )
}
