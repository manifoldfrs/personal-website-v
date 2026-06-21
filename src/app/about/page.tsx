import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "About | Faris Habib",
	description: "A bit about Faris Habib.",
};

export default function AboutPage() {
	return (
		<div>
			<h1 className="sr-only">About</h1>

			<div className="prose">
				<p>
					My personal website for reflections on everything
					I&apos;m curious about. I find the most interesting
					ideas often come from the cross-pollination of
					different explanations.
				</p>
			</div>

			<section className="mt-16">
				<h2 className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
					Vibes
				</h2>
				<div id="vibes-slot" />
			</section>
		</div>
	);
}
