"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MusicPlayer, type Track } from "./music-player"

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Writing", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const

export function Sidebar({
  tracks,
  playlistUri,
  playlistUrl,
}: {
  tracks: Track[]
  playlistUri: string
  playlistUrl: string
}) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <aside className="shrink-0 md:sticky md:top-0 md:h-screen md:w-56 md:pt-24">
      <div className="flex flex-col gap-10 py-6 md:gap-12 md:py-0">
        {/* Music player (lives where the logo used to) */}
        <MusicPlayer tracks={tracks} playlistUri={playlistUri} playlistUrl={playlistUrl} />

        <nav>
          <ul className="flex flex-row flex-wrap gap-x-6 gap-y-2 md:flex-col md:gap-4">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`group inline-flex items-center gap-2 font-mono text-sm tracking-wide transition-colors ${
                      active ? "text-accent" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-opacity duration-200 ${
                        active ? "bg-accent opacity-100" : "bg-foreground opacity-0 group-hover:opacity-40"
                      }`}
                    />
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
