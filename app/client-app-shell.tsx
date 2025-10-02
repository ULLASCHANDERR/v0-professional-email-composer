"use client"

import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import { SidebarNav } from "@/components/sidebar-nav"
import { ApiKeyWarning } from "@/components/api-key-warning"
import { Suspense, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function ClientAppShell({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <header className="md:hidden sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SheetHeader className="px-4 py-3">
                  <SheetTitle>AI Text Tools</SheetTitle>
                </SheetHeader>
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="text-sm font-semibold">AI Text Tools</span>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <SidebarNav />
        </div>
        <main className="flex-1 p-4 md:p-8">
          <ApiKeyWarning />
          {children}
        </main>
      </div>
      <Analytics />
    </Suspense>
  )
}
