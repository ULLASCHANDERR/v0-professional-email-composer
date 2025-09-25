import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { SidebarNav } from "@/components/sidebar-nav"
import { ApiKeyWarning } from "@/components/api-key-warning" // Import ApiKeyWarning
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "AI Text Tools",
  description: "Professional text rephrasing and email composition powered by AI",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex min-h-screen">
            <SidebarNav />
            <main className="flex-1 p-8">
              <ApiKeyWarning />
              {children}
            </main>
          </div>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
