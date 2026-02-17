"use client"

import Link from "next/link"
import { motion } from "framer-motion"

interface PostBodyProps {
  title: string
  date: string
  content: string
  tags?: string[]
}

export function PostBody({ title, date, content, tags }: PostBodyProps) {
  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <article className="min-h-screen pt-32 pb-24 px-8 md:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Post Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-6">
            {formatDate(date)}
          </p>
          <h1 className="font-sans text-4xl md:text-6xl font-light tracking-tight mb-8">
            {title}
          </h1>
          
          {tags && tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] tracking-wider px-3 py-1 border border-accent/30 rounded-full text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.header>

        {/* Post Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="prose"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 pt-8 border-t border-white/10"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-accent transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to all posts
          </Link>
        </motion.div>
      </div>
    </article>
  )
}
