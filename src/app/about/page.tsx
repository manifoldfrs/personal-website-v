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

			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src="/images/scotland.png"
				alt="A photo from Scotland"
				loading="lazy"
				className="mt-10 w-full rounded-lg border border-border"
			/>
		</div>
	);
}
