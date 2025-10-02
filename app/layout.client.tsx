import type React from "react"
import ClientAppShell from "./client-app-shell"

export function LayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientAppShell>{children}</ClientAppShell>
}
