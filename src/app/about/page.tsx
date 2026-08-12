import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About | Faris Habib",
  description: "A bit about Faris Habib.",
}

export default function AboutPage() {
  return (
    <div>
      <h1 className="terminal-command-label"><span aria-hidden="true">$</span> cat ~/about.md</h1>

      <div className="prose terminal-section">
        <p>
          My personal website for reflections on everything
          I&apos;m curious about. I find the most interesting
          ideas often come from the cross-pollination of
          different explanations.
        </p>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/scotland.png"
        alt="A photo from Scotland"
        loading="lazy"
        className="mt-10 w-full border border-border bg-black/30 p-1"
      />
    </div>
  )
}
