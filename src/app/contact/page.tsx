"use client";

import { useState } from "react";
import { submitContactForm } from "./actions";

const inputClass =
        "w-full rounded-md border border-border bg-black/30 px-4 py-3 font-serif text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-accent focus:outline-none";

export default function ContactPage() {
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [submitStatus, setSubmitStatus] = useState<
                "idle" | "success" | "error"
        >("idle");
        const [errorMessage, setErrorMessage] = useState("");

        async function handleSubmit(formData: FormData) {
                setIsSubmitting(true);
                setSubmitStatus("idle");

                const result = await submitContactForm(formData);

                setIsSubmitting(false);
                if (result.success) {
                        setSubmitStatus("success");
                        const form = document.getElementById(
                                "contact-form",
                        ) as HTMLFormElement | null;
                        form?.reset();
                } else {
                        setSubmitStatus("error");
                        setErrorMessage(
                                result.error ||
                                        "Something went wrong. Please try again.",
                        );
                }
        }

        return (
                <div className="max-w-xl">
                        <h1 className="sr-only">Contact</h1>

                        <p className="prose mb-10">
                                Want to chat? Send a message and I&apos;ll get
                                back to you.
                        </p>

                        <form
                                id="contact-form"
                                action={handleSubmit}
                                className="space-y-6"
                        >
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
                                        />
                                </div>

                                <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="rounded-md bg-accent px-6 py-3 font-mono text-sm uppercase tracking-widest text-accent-foreground transition-colors hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                        {isSubmitting
                                                ? "Sending..."
                                                : "Send message"}
                                </button>

                                {submitStatus === "success" && (
                                        <p className="font-mono text-sm text-accent">
                                                Message sent. I&apos;ll get back
                                                to you soon.
                                        </p>
                                )}
                                {submitStatus === "error" && (
                                        <p className="font-mono text-sm text-destructive">
                                                {errorMessage}
                                        </p>
                                )}
                        </form>
                </div>
        );
}
