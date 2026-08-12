import type { ReactNode } from "react"
import Link from "next/link"
import { TerminalCommandBar } from "@/components/terminal-command-bar"
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/footer"
import { MusicPlayer, type Track } from "@/components/music-player"
import { routeLinks, socialLinks } from "@/lib/site-navigation"

const socialIcons = {
  GitHub: GitHubIcon,
  X: XIcon,
  LinkedIn: LinkedInIcon,
} as const

export function TerminalShell({
  children,
  tracks,
  playlistUri,
  playlistUrl,
  postSlugs,
}: {
  children: ReactNode
  tracks: Track[]
  playlistUri: string
  playlistUrl: string
  postSlugs: readonly string[]
}) {
  return (
    <div className="terminal-layout">
      <div className="terminal-window">
        <aside className="terminal-vinyl-rail" aria-label="Music player">
          <MusicPlayer tracks={tracks} playlistUri={playlistUri} playlistUrl={playlistUrl} />
        </aside>

        <main id="main-content" className="terminal-content">{children}</main>

        <footer className="terminal-footer">
          <TerminalCommandBar postSlugs={postSlugs} />
          <nav aria-label="Primary navigation" className="terminal-links">
            {routeLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span aria-hidden="true">[</span>{link.label.toLowerCase()}<span aria-hidden="true">]</span>
              </Link>
            ))}
          </nav>
          <div className="terminal-footer-meta">
            <div className="terminal-socials">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                >
                  {socialIcons[link.label]}
                </a>
              ))}
            </div>
            <span>© {new Date().getFullYear()} Faris Habib</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
