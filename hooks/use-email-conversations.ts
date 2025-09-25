"use client"

import { useState, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"

export interface EmailMessage {
  id: string
  role: "user" | "ai"
  content: string
  timestamp: number
}

export interface EmailConversation {
  id: string
  subject: string
  messages: EmailMessage[]
  createdAt: number
  updatedAt: number
}

const EMAIL_CONVERSATIONS_STORAGE_KEY = "ai-text-app-email-conversations"

export function useEmailConversations() {
  const [conversations, setConversations] = useState<EmailConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const storedConversations = localStorage.getItem(EMAIL_CONVERSATIONS_STORAGE_KEY)
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations))
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(EMAIL_CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations))
    }
  }, [conversations, isLoaded])

  const createNewConversation = useCallback(() => {
    const newConversation: EmailConversation = {
      id: uuidv4(),
      subject: "New Email Conversation",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setConversations((prev) => [newConversation, ...prev])
    setActiveConversationId(newConversation.id)
    return newConversation
  }, [])

  const getConversation = useCallback(
    (id: string) => {
      return conversations.find((conv) => conv.id === id)
    },
    [conversations],
  )

  const updateConversation = useCallback((updatedConv: EmailConversation) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === updatedConv.id ? { ...updatedConv, updatedAt: Date.now() } : conv)),
    )
  }, [])

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((conv) => conv.id !== id))
      if (activeConversationId === id) {
        setActiveConversationId(null)
      }
    },
    [activeConversationId],
  )

  const addMessageToConversation = useCallback((conversationId: string, role: "user" | "ai", content: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, { id: uuidv4(), role, content, timestamp: Date.now() }],
              updatedAt: Date.now(),
            }
          : conv,
      ),
    )
  }, [])

  const activeConversation = activeConversationId ? getConversation(activeConversationId) : null

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createNewConversation,
    updateConversation,
    deleteConversation,
    addMessageToConversation,
    isLoaded,
  }
}
