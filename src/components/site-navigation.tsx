"use client"

import { usePathname } from "next/navigation"
import { TransitionLink } from "@/components/transition-link"

const links = [
  { href: "/", label: "[home]" },
  { href: "/about", label: "[about]" },
] as const

/** The intentionally small primary navigation shared by every page. */
export function SiteNavigation() {
  const pathname = usePathname()

  return (
    <header className="site-header">
      <nav aria-label="Main">
        {links.map(({ href, label }) => (
          <TransitionLink key={href} href={href} current={pathname === href ? "page" : undefined}>
            {label}
          </TransitionLink>
        ))}
      </nav>
    </header>
  )
}
