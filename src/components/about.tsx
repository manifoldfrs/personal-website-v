"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
        motion,
        useMotionValue,
        useMotionValueEvent,
        animate,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const values = ["Truth", "Respect", "Progress", "Agency", "Conviction"];

export function About() {
        const containerRef = useRef<HTMLDivElement>(null);
        const contentRef = useRef<HTMLDivElement>(null);
        const [isDragging, setIsDragging] = useState(false);
        const [constraints, setConstraints] = useState({ left: 0, right: 0 });
        const [showLeftArrow, setShowLeftArrow] = useState(false);
        const [showRightArrow, setShowRightArrow] = useState(true);

        const x = useMotionValue(0);

        // Calculate drag constraints based on content width
        useEffect(() => {
                const updateConstraints = () => {
                        if (containerRef.current && contentRef.current) {
                                const containerWidth =
                                        containerRef.current.offsetWidth;
                                const contentWidth =
                                        contentRef.current.scrollWidth;
                                const maxDrag = Math.min(
                                        0,
                                        containerWidth - contentWidth,
                                );
                                setConstraints({ left: maxDrag, right: 0 });
                                setShowRightArrow(maxDrag < 0);
                        }
                };

                updateConstraints();
                window.addEventListener("resize", updateConstraints);
                return () =>
                        window.removeEventListener("resize", updateConstraints);
        }, []);

        // Track x position to update arrow visibility
        useMotionValueEvent(x, "change", (latest) => {
                setShowLeftArrow(latest < -10);
                setShowRightArrow(latest > constraints.left + 10);
        });

        // Handle wheel events for horizontal scrolling
        const handleWheel = useCallback(
                (e: WheelEvent) => {
                        const delta =
                                Math.abs(e.deltaX) > Math.abs(e.deltaY)
                                        ? e.deltaX
                                        : e.deltaY;

                        if (delta === 0) return;

                        const currentX = x.get();
                        const newX = Math.max(
                                constraints.left,
                                Math.min(0, currentX - delta),
                        );

                        if (newX !== currentX) {
                                e.preventDefault();
                                animate(x, newX, {
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                });
                        }
                },
                [x, constraints],
        );

        // Attach wheel event listener
        useEffect(() => {
                const container = containerRef.current;
                if (!container) return;

                container.addEventListener("wheel", handleWheel, {
                        passive: false,
                });
                return () =>
                        container.removeEventListener("wheel", handleWheel);
        }, [handleWheel]);

        // Scroll by a fixed amount when clicking arrows
        const scrollBy = (direction: "left" | "right") => {
                const scrollAmount = 300;
                const currentX = x.get();
                const newX =
                        direction === "left"
                                ? Math.min(0, currentX + scrollAmount)
                                : Math.max(
                                          constraints.left,
                                          currentX - scrollAmount,
                                  );
                animate(x, newX, {
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                });
        };

        return (
                <section className="relative py-32 overflow-hidden md:py-0">
                        {/* Section Header */}
                        <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="px-8 md:px-12 mb-0 py-20"
                        >
                                <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4">
                                        02 — PHILOSOPHY
                                </p>
                                <h2 className="font-mono text-3xl md:text-5xl font-light italic">
                                        Values
                                </h2>
                        </motion.div>

                        {/* Horizontal Drag Container */}
                        <div
                                ref={containerRef}
                                className="relative overflow-hidden py-4"
                                style={{
                                        cursor: isDragging
                                                ? "grabbing"
                                                : "grab",
                                }}
                        >
                                {/* Left Arrow */}
                                <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{
                                                opacity: showLeftArrow ? 1 : 0,
                                        }}
                                        transition={{ duration: 0.2 }}
                                        onClick={() => scrollBy("left")}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full border border-white/20 bg-background/80 backdrop-blur-sm hover:border-accent hover:text-accent transition-colors"
                                        style={{
                                                pointerEvents: showLeftArrow
                                                        ? "auto"
                                                        : "none",
                                        }}
                                >
                                        <ChevronLeft className="w-5 h-5" />
                                </motion.button>

                                {/* Right Arrow */}
                                <motion.button
                                        initial={{ opacity: 1 }}
                                        animate={{
                                                opacity: showRightArrow ? 1 : 0,
                                        }}
                                        transition={{ duration: 0.2 }}
                                        onClick={() => scrollBy("right")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full border border-white/20 bg-background/80 backdrop-blur-sm hover:border-accent hover:text-accent transition-colors"
                                        style={{
                                                pointerEvents: showRightArrow
                                                        ? "auto"
                                                        : "none",
                                        }}
                                >
                                        <ChevronRight className="w-5 h-5" />
                                </motion.button>

                                <motion.div
                                        ref={contentRef}
                                        drag="x"
                                        dragConstraints={constraints}
                                        dragElastic={0.1}
                                        dragTransition={{
                                                bounceStiffness: 300,
                                                bounceDamping: 30,
                                        }}
                                        onDragStart={() => setIsDragging(true)}
                                        onDragEnd={() => setIsDragging(false)}
                                        style={{ x }}
                                        className="flex gap-16 md:gap-24 px-8 md:px-12 whitespace-nowrap w-max"
                                >
                                        {values.map((value, index) => (
                                                <motion.p
                                                        key={index}
                                                        className="text-4xl md:text-6xl lg:text-7xl font-mono font-light tracking-tight text-white/90 select-none"
                                                        style={{
                                                                WebkitTextStroke:
                                                                        index %
                                                                                2 ===
                                                                        0
                                                                                ? "none"
                                                                                : "1px rgba(255,255,255,0.3)",
                                                                color:
                                                                        index %
                                                                                2 ===
                                                                        0
                                                                                ? "inherit"
                                                                                : "transparent",
                                                        }}
                                                >
                                                        {value}
                                                </motion.p>
                                        ))}
                                </motion.div>
                        </div>

                        {/* Decorative Line */}
                        <motion.div
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{
                                        duration: 1.5,
                                        ease: [0.25, 0.46, 0.45, 0.94],
                                }}
                                className="mt-16 mx-8 md:mx-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent origin-left"
                        />
                </section>
        );
}
