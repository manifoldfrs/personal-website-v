"use client"

import Link from "next/link"
import type { ReactNode } from "react"

interface TransitionLinkProps {
  readonly href: `/${string}`
  readonly children: ReactNode
  readonly className?: string
  readonly ariaLabel?: string
  readonly current?: "page"
}

/** Keeps native document transitions while preserving Link's accessible anchor behavior. */
export function TransitionLink({ href, children, className, ariaLabel, current }: TransitionLinkProps) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={className}
      aria-label={ariaLabel}
      aria-current={current}
      data-cursor-hover
      onNavigate={(event) => {
        event.preventDefault()
        window.location.assign(href)
      }}
    >
      {children}
    </Link>
  )
}
