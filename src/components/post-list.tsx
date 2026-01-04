"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import type { PostSummary } from "@/lib/blog"

interface PostListProps {
  posts: readonly PostSummary[]
  showHeader?: boolean
}

export function PostList({ posts, showHeader = true }: PostListProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <section className="relative py-32 px-8 md:px-12 md:py-24">
      {/* Section Header */}
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">
            03 — WRITINGS
          </p>
          <h2 className="font-sans text-3xl md:text-5xl font-light italic">
            Thoughts & Reflections
          </h2>
        </motion.div>
      )}

      {/* Posts List */}
      <div className="relative">
        {posts.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="relative border-t border-white/10 py-8 md:py-12"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Link
              href={`/blog/${post.slug}`}
              data-cursor-hover
              className="group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Date */}
              <span className="font-mono text-xs text-muted-foreground tracking-widest order-1 md:order-none w-24 shrink-0">
                {formatDate(post.date)}
              </span>

              {/* Title */}
              <motion.h3
                className="font-sans text-2xl md:text-4xl lg:text-5xl font-light tracking-tight group-hover:text-accent transition-colors duration-300 flex-1"
                animate={{
                  x: hoveredIndex === index ? 20 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {post.title}
              </motion.h3>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap order-2 md:order-none">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] tracking-wider px-3 py-1 border border-white/20 rounded-full text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Arrow indicator */}
              <motion.span
                className="hidden md:block font-mono text-accent"
                animate={{
                  x: hoveredIndex === index ? 10 : 0,
                  opacity: hoveredIndex === index ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Bottom Border */}
      <div className="border-t border-white/10" />
    </section>
  )
}
