"use client"

import { useActionState } from "react"
import { submitContactForm, type ContactState } from "./actions"

const inputClass =
  "w-full rounded-md border border-border bg-black/30 px-4 py-3 font-serif text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-accent focus:outline-none"

const initialState: ContactState = { status: "idle" }

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState)
  const values = state.status === "error" ? state.values : undefined

  return (
    <div className="max-w-xl">
      <h1 className="sr-only">Contact</h1>

      <p className="prose mb-10">
        Want to chat? Send a message and I&apos;ll get back to you.
      </p>

      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block font-mono text-xs uppercase tracking-widest text-muted-foreground"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className={inputClass}
            placeholder="Your name"
            defaultValue={values?.name}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block font-mono text-xs uppercase tracking-widest text-muted-foreground"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className={inputClass}
            placeholder="your@email.com"
            defaultValue={values?.email}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="message"
            className="block font-mono text-xs uppercase tracking-widest text-muted-foreground"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className={`${inputClass} resize-none`}
            placeholder="Your message..."
            defaultValue={values?.message}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-accent px-6 py-3 font-mono text-sm uppercase tracking-widest text-accent-foreground transition-colors hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Sending..." : "Send message"}
        </button>

        {state.status === "success" && (
          <p className="font-mono text-sm text-accent">
            Message sent. I&apos;ll get back to you soon.
          </p>
        )}
        {state.status === "error" && state.error && (
          <p className="font-mono text-sm text-destructive">{state.error}</p>
        )}
      </form>
    </div>
  )
}
