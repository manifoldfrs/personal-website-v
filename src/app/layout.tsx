import type React from "react";
import type { Metadata, Viewport } from "next";
import {
        Archivo,
        IBM_Plex_Mono,
        IBM_Plex_Sans,
        IBM_Plex_Serif,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { Footer } from "@/components/footer";
import { getPlaylistTracks, PLAYLIST_URI, PLAYLIST_URL } from "@/lib/spotify/playlist";
import "./globals.css";

// Display: Archivo at its widest width axis (set via .display in globals.css)
const archivo = Archivo({
        subsets: ["latin"],
        axes: ["wdth"],
        variable: "--font-archivo",
        display: "swap",
});

// Body: IBM Plex Serif
const ibmPlexSerif = IBM_Plex_Serif({
        subsets: ["latin"],
        weight: ["400", "500", "600", "700"],
        style: ["normal", "italic"],
        variable: "--font-ibm-plex-serif",
        display: "swap",
});

// UI / headings: IBM Plex Sans
const ibmPlexSans = IBM_Plex_Sans({
        subsets: ["latin"],
        weight: ["400", "500", "600", "700"],
        variable: "--font-ibm-plex-sans",
        display: "swap",
});

// Labels / code: IBM Plex Mono
const ibmPlexMono = IBM_Plex_Mono({
        subsets: ["latin"],
        weight: ["400", "500", "600"],
        variable: "--font-ibm-plex-mono",
        display: "swap",
});

export const metadata: Metadata = {
        title: "Faris Habib",
        description: "Faris' personal website",
        metadataBase: new URL("https://hbb.dev"),
        openGraph: {
                title: "Faris Habib",
                url: "https://hbb.dev",
                siteName: "Faris Habib",
                type: "website",
        },
        twitter: {
                card: "summary_large_image",
                title: "Faris Habib",
        },
};

export const viewport: Viewport = {
        themeColor: "#0e121a",
};

export default async function RootLayout({
        children,
}: Readonly<{
        children: React.ReactNode;
}>) {
        const tracks = await getPlaylistTracks();
        return (
                <html
                        lang="en"
                        className={`${archivo.variable} ${ibmPlexSans.variable} ${ibmPlexSerif.variable} ${ibmPlexMono.variable}`}
                >
                        <body className="font-serif">
                                <div className="mx-auto flex w-full max-w-5xl flex-col px-6 md:flex-row md:gap-14 md:px-10">
                                        <Sidebar tracks={tracks} playlistUri={PLAYLIST_URI} playlistUrl={PLAYLIST_URL} />
                                        <div className="flex min-h-screen flex-1 flex-col">
                                                <main className="flex-1 pb-16 pt-4 md:pt-24">
                                                        <Link
                                                                href="/"
                                                                className="display inline-block text-xl text-primary transition-colors hover:text-accent md:text-2xl"
                                                        >
                                                                Faris Habib
                                                        </Link>
                                                        <hr className="mb-8 mt-6 border-border" />
                                                        {children}
                                                </main>
                                                <Footer />
                                        </div>
                                </div>
                                <Analytics />
                        </body>
                </html>
        );
}
