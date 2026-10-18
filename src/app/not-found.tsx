import { TransitionLink } from "@/components/transition-link"

export default function NotFound() {
  return (
    <section className="status-page">
      <h1>404</h1>
      <p>This page could not be found.</p>
      <TransitionLink href="/">← Back home</TransitionLink>
    </section>
  )
}
