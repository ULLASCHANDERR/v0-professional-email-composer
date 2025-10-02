"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useEmailConversations } from "@/hooks/use-email-conversations"

type ConversationsContextValue = ReturnType<typeof useEmailConversations>

const EmailConversationsContext = createContext<ConversationsContextValue | null>(null)

export function EmailConversationsProvider({ children }: { children: React.ReactNode }) {
  const value = useEmailConversations()
  return <EmailConversationsContext.Provider value={value}>{children}</EmailConversationsContext.Provider>
}

export function useEmailConversationsContext() {
  const ctx = useContext(EmailConversationsContext)
  if (!ctx) {
    throw new Error("useEmailConversationsContext must be used within EmailConversationsProvider")
  }
  return ctx
}
