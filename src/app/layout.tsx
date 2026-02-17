import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, JetBrains_Mono, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "Faris Habib | Software Engineer",
  description: "Software Engineer building products that matter. Reflections on programming and life.",
  metadataBase: new URL("https://hbb.dev"),
  openGraph: {
    title: "Faris Habib | Software Engineer",
    description: "Software Engineer building products that matter.",
    url: "https://hbb.dev",
    siteName: "Faris",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Faris Habib | Software Engineer",
    description: "Software Engineer building products that matter.",
  },
}

export const viewport: Viewport = {
  themeColor: "#050505",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased overflow-x-hidden">
        <div className="noise-overlay" />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
