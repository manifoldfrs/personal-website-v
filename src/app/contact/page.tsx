"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SmoothScroll } from "@/components/smooth-scroll"
import { CustomCursor } from "@/components/custom-cursor"
import { submitContactForm } from "./actions"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setSubmitStatus("idle")

    const result = await submitContactForm(formData)

    setIsSubmitting(false)
    if (result.success) {
      setSubmitStatus("success")
      // Reset form
      const form = document.getElementById("contact-form") as HTMLFormElement
      form?.reset()
    } else {
      setSubmitStatus("error")
      setErrorMessage(result.error || "Something went wrong. Please try again.")
    }
  }

  return (
    <SmoothScroll>
      <CustomCursor />
      <Navbar />
      <main className="min-h-screen pt-32 pb-24 px-8 md:px-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">
              03 — CONTACT
            </p>
            <h1 className="font-sans text-4xl md:text-6xl font-light tracking-tight mb-8">
              Let&apos;s <span className="italic">connect</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have a project in mind or just want to chat? Send me a message.
              </p>
            </motion.div>

          {/* Contact Form */}
          <motion.form
            id="contact-form"
            action={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block font-mono text-xs tracking-widest text-muted-foreground"
              >
                NAME
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full bg-transparent border-b border-white/20 py-4 text-lg focus:outline-none focus:border-accent transition-colors"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block font-mono text-xs tracking-widest text-muted-foreground"
              >
                EMAIL
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full bg-transparent border-b border-white/20 py-4 text-lg focus:outline-none focus:border-accent transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="block font-mono text-xs tracking-widest text-muted-foreground"
              >
                MESSAGE
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full bg-transparent border-b border-white/20 py-4 text-lg focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder="Your message..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative px-8 py-4 border border-white/20 rounded-full font-mono text-sm tracking-widest uppercase bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
            </button>

            {submitStatus === "success" && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400 font-mono text-sm"
              >
                Message sent successfully! I&apos;ll get back to you soon.
              </motion.p>
            )}

            {submitStatus === "error" && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 font-mono text-sm"
              >
                {errorMessage}
              </motion.p>
            )}
          </motion.form>

          {/* Alternative Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-24 pt-16 border-t border-white/10"
          >
            <h2 className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-8">
              FIND ME ON
            </h2>
            <div className="flex flex-wrap gap-6">
              {[
                { label: "GitHub", href: "https://github.com/manifoldfrs" },
                { label: "LinkedIn", href: "https://linkedin.com/in/farishabib" },
                { label: "X", href: "https://x.com/frshbb" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm tracking-wider text-muted-foreground hover:text-accent transition-colors underline underline-offset-4"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </SmoothScroll>
  )
}
