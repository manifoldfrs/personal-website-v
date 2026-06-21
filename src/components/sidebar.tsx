"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Writing", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <aside className="shrink-0 md:sticky md:top-0 md:h-screen md:w-40 md:pt-24">
      <div className="flex items-center justify-between gap-4 py-5 md:flex-col md:items-start md:gap-16 md:py-0">
        {/* Avatar / home link */}
        <Link href="/" aria-label="Home — Faris Habib" className="group inline-flex">
          <span className="display flex h-11 w-11 items-center justify-center rounded-full bg-accent text-sm tracking-normal text-accent-foreground ring-2 ring-highlight/80 ring-offset-2 ring-offset-background transition-transform duration-300 group-hover:scale-105">
            FH
          </span>
        </Link>

        {/* Navigation */}
        <nav>
          <ul className="flex items-center gap-6 md:flex-col md:items-start md:gap-3.5">
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
