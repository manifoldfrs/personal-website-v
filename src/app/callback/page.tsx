"use client"

import { useEffect } from "react"
import { completeAuth, consumeReturnPath } from "@/lib/spotify/auth"

export default function CallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    if (!code) {
      window.location.replace("/")
      return
    }
    completeAuth(code).then((ok) => {
      const back = consumeReturnPath()
      // full reload so the player re-initializes in Web Playback SDK mode
      window.location.replace(ok ? back : "/")
    })
  }, [])

  return <p className="py-16 font-mono text-sm text-muted-foreground">Connecting to Spotify…</p>
}
