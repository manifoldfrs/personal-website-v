"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { CustomCursor } from "@/components/custom-cursor";

export default function AboutPage() {
        return (
                <SmoothScroll>
                        <CustomCursor />
                        <Navbar />
                        <main className="min-h-screen pt-32 pb-24 px-8 md:px-12">
                                <div className="max-w-4xl mx-auto">
                                        {/* Header */}
                                        <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.8 }}
                                                className="mb-16"
                                        >
                                                <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">
                                                        01 — ABOUT
                                                </p>
                                                <h1 className="font-sans text-4xl md:text-6xl font-light tracking-tight mb-8">
                                                        Building products that{" "}
                                                        <span className="italic">
                                                                matter
                                                        </span>
                                                </h1>
                                        </motion.div>

                                        {/* Bio */}
                                        <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                        duration: 0.8,
                                                        delay: 0.2,
                                                }}
                                                className="space-y-8 text-lg leading-relaxed text-muted-foreground"
                                        >
                                                <p>
                                                        You&apos;ll find
                                                        reflections on
                                                        everything from
                                                        programming to health
                                                        and fitness. From
                                                        religious contemplation,
                                                        to practical
                                                        philoosophy, and poetry.
                                                        The most interesting
                                                        insights often emerge
                                                        from the
                                                        cross-pollination of
                                                        ideas.
                                                </p>
                                        </motion.div>

                                        {/* Questions */}
                                        <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                        duration: 0.8,
                                                        delay: 0.4,
                                                }}
                                                className="mt-24"
                                        >
                                                <h2 className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-8">
                                                        QUESTIONS I'M WORKING ON
                                                </h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        {[
                                                                {
                                                                        title: "What programming paradigms are outdated?",
                                                                        description:
                                                                                "A lot of devs forget about concepts like performance. This is a great course to refresh yourself:",
                                                                        link: {
                                                                                url: "https://www.computerenhance.com/p/table-of-contents",
                                                                                text: "Performance Aware Programming",
                                                                        },
                                                                },
                                                                {
                                                                        title: "What parts of Christianity could use better explanations?",
                                                                        description:
                                                                                "Critical rationalism for the win. Faith in God is informed by reason and personal agency, not by blind belief.",
                                                                },
                                                                {
                                                                        title: "Where does crypto and AI intersect?",
                                                                        description:
                                                                                "x402 is one example, btw I built the website: ",
                                                                        link: {
                                                                                url: "https://x402.org",
                                                                                text: "x402.org",
                                                                        },
                                                                },
                                                                {
                                                                        title: "Why is it hard for people to think for themselves? How can we increase our cognitive security?",
                                                                        description:
                                                                                "Genuinely surprised at how big of an issue this is.",
                                                                },
                                                        ].map(
                                                                (
                                                                        value,
                                                                        index,
                                                                ) => (
                                                                        <motion.div
                                                                                key={
                                                                                        value.title
                                                                                }
                                                                                initial={{
                                                                                        opacity: 0,
                                                                                        y: 20,
                                                                                }}
                                                                                animate={{
                                                                                        opacity: 1,
                                                                                        y: 0,
                                                                                }}
                                                                                transition={{
                                                                                        duration: 0.6,
                                                                                        delay:
                                                                                                0.5 +
                                                                                                index *
                                                                                                        0.1,
                                                                                }}
                                                                                className="p-6 border border-white/10 rounded-lg"
                                                                        >
                                                                                <h3 className="font-mono text-accent mb-2">
                                                                                        {
                                                                                                value.title
                                                                                        }
                                                                                </h3>
                                                                                <p className="text-sm text-muted-foreground">
                                                                                        {
                                                                                                value.description
                                                                                        }
                                                                                        {value.link && (
                                                                                                <>
                                                                                                        {" "}
                                                                                                        <a
                                                                                                                href={
                                                                                                                        value
                                                                                                                                .link
                                                                                                                                .url
                                                                                                                }
                                                                                                                target="_blank"
                                                                                                                rel="noopener noreferrer"
                                                                                                                className="text-accent hover:underline"
                                                                                                        >
                                                                                                                {
                                                                                                                        value
                                                                                                                                .link
                                                                                                                                .text
                                                                                                                }
                                                                                                        </a>
                                                                                                </>
                                                                                        )}
                                                                                </p>
                                                                        </motion.div>
                                                                ),
                                                        )}
                                                </div>
                                        </motion.div>

                                        {/* Currently Listening */}
                                        <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                        duration: 0.8,
                                                        delay: 0.6,
                                                }}
                                                className="mt-24"
                                        >
                                                <h2 className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-8">
                                                        VIBES
                                                </h2>
                                                <div className="w-full">
                                                        <iframe
                                                                style={{
                                                                        borderRadius:
                                                                                "12px",
                                                                }}
                                                                src="https://open.spotify.com/embed/track/3GBq4qNiAyjBula9gsZHry?si=97716b51fea74f60"
                                                                width="100%"
                                                                height="352"
                                                                allowFullScreen
                                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                                loading="lazy"
                                                        />
                                                </div>
                                        </motion.div>
                                </div>
                        </main>
                        <Footer />
                </SmoothScroll>
        );
}
