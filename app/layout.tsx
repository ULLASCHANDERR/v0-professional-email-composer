import type React from "react"
import "./globals.css"
import { LayoutClient } from "./layout.client"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
