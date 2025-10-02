"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useApiKey } from "@/hooks/use-api-key"
import { useToast } from "@/hooks/use-toast"
import { ApiKeyWarning } from "@/components/api-key-warning"
import { EmailSidebar } from "@/components/email-sidebar"
import { Mail, Loader2, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmailConversationsProvider, useEmailConversationsContext } from "@/contexts/email-conversations-context"
import { addApiHistory, getComposerLoadPayload, clearComposerLoadPayload } from "@/hooks/use-api-history"

function ComposerContent() {
  const { apiKey, hasApiKey, isLoaded: apiKeyLoaded } = useApiKey()
  const {
    conversations,
    activeConversation,
    setActiveConversationId,
    createNewConversation,
    updateConversation,
    addMessageToConversation,
    isLoaded: conversationsLoaded,
  } = useEmailConversationsContext()
  const { toast } = useToast()

  const [subject, setSubject] = useState(activeConversation?.subject || "")
  const [currentDraft, setCurrentDraft] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    if (conversationsLoaded && !activeConversation && conversations.length > 0) {
      setActiveConversationId(conversations[0].id)
    } else if (conversationsLoaded && conversations.length === 0) {
      const newConv = createNewConversation()
      setActiveConversationId(newConv.id)
    }
  }, [conversationsLoaded, activeConversation, conversations, setActiveConversationId, createNewConversation])

  useEffect(() => {
    if (mobileSidebarOpen && activeConversation) setMobileSidebarOpen(false)
  }, [activeConversation, mobileSidebarOpen])

  useEffect(() => {
    if (activeConversation) {
      setSubject(activeConversation.subject)
      const lastAiMessage = activeConversation.messages.filter((msg) => msg.role === "ai").pop()
      setCurrentDraft(lastAiMessage ? lastAiMessage.content : "")
    } else {
      setSubject("New Email Conversation")
      setCurrentDraft("")
    }
  }, [activeConversation])

  // Helper functions to derive a subject more reliably
  const extractSubjectFromText = (text: string): string | null => {
    if (!text) return null
    // Try "Subject: ..." line
    const m = text.match(/^\s*subject\s*:\s*(.+)$/im)
    if (m && m[1]?.trim()) return m[1].trim()
    // Fallback: first non-empty line
    const firstLine = text
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.length > 0)
    return firstLine ? firstLine.slice(0, 80) : null
  }

  useEffect(() => {
    const payload = getComposerLoadPayload()
    if (payload) {
      if (payload.currentDraft) {
        setCurrentDraft(payload.currentDraft)
        // if subject still default, try derive from payload
        if (!subject || subject === "New Email Conversation") {
          const derived = extractSubjectFromText(payload.currentDraft)
          if (derived && activeConversation) {
            setSubject(derived)
            updateConversation({ ...activeConversation, subject: derived })
          }
        }
      }
      // Optional: if payload includes conversation, we could seed it; keeping simple for now.
      clearComposerLoadPayload()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation])

  const handleGenerateEmail = async () => {
    if (!hasApiKey) {
      toast({
        title: "Error",
        description: "Please configure your API key in settings.",
        variant: "destructive",
      })
      return
    }

    if (!currentDraft.trim() && (!activeConversation || activeConversation.messages.length === 0)) {
      toast({
        title: "Error",
        description: "Please enter some text to generate or modify the email.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/compose-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation: activeConversation?.messages || [],
          currentDraft,
          apiKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to compose email.")
      }

      const generatedEmail = data.generatedEmail

      if (activeConversation) {
        addMessageToConversation(activeConversation.id, "user", currentDraft)
        addMessageToConversation(activeConversation.id, "ai", generatedEmail)
        setCurrentDraft(generatedEmail)

        if (activeConversation.subject === "New Email Conversation") {
          const newSubject =
            (subject && subject.trim()) ||
            extractSubjectFromText(currentDraft) ||
            extractSubjectFromText(generatedEmail) ||
            "New Email"
          updateConversation({ ...activeConversation, subject: newSubject })
          setSubject(newSubject)
        }
      } else {
        const newConv = createNewConversation()
        addMessageToConversation(newConv.id, "user", currentDraft)
        addMessageToConversation(newConv.id, "ai", generatedEmail)
        setCurrentDraft(generatedEmail)

        const newSubject =
          (subject && subject.trim()) ||
          extractSubjectFromText(currentDraft) ||
          extractSubjectFromText(generatedEmail) ||
          "New Email"
        updateConversation({ ...newConv, subject: newSubject })
        setSubject(newSubject)
        setActiveConversationId(newConv.id)
      }

      addApiHistory({
        id: crypto.randomUUID(),
        type: "compose",
        timestamp: Date.now(),
        model: "gemini-2.0-flash",
        currentDraft: generatedEmail,
        conversation: (activeConversation?.messages || []).map((m: any) => ({ role: m.role, content: m.content })),
      })

      toast({
        title: "Success",
        description: "Email composed/modified successfully!",
      })
    } catch (error: any) {
      console.error("[v0] Compose Email error:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred during email composition.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDraft = () => {
    if (activeConversation) {
      const updatedConversation = { ...activeConversation, subject, messages: activeConversation.messages }
      const lastMessage = activeConversation.messages[activeConversation.messages.length - 1]
      if (!lastMessage || lastMessage.content !== currentDraft || lastMessage.role !== "ai") {
        addMessageToConversation(activeConversation.id, "ai", currentDraft)
      }
      updateConversation(updatedConversation)
      toast({
        title: "Saved",
        description: "Email draft saved.",
      })
    }
  }

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value)
    if (activeConversation) {
      updateConversation({ ...activeConversation, subject: e.target.value })
    }
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className={cn("md:block", mobileSidebarOpen ? "block" : "hidden")}>
        <EmailSidebar />
      </div>

      <div className="flex-1 flex flex-col p-4 md:p-8">
        <div className="mb-4 md:mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileSidebarOpen((s) => !s)}>
              <Mail className="h-5 w-5" />
              <span className="sr-only">Toggle conversations</span>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 text-balance">Email Composer</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Compose, modify, and manage your email conversations with AI assistance.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const newConv = createNewConversation()
              setActiveConversationId(newConv.id)
              setSubject(newConv.subject)
              setCurrentDraft("")
            }}
          >
            New Chat
          </Button>
        </div>

        {apiKeyLoaded && <ApiKeyWarning />}

        {activeConversation && (
          <Card className="flex-1 flex flex-col mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Current Email
              </CardTitle>
              <CardDescription>Edit your draft or use AI to generate/modify the email.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  placeholder="Enter email subject"
                  value={subject}
                  onChange={handleSubjectChange}
                />
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor="email-draft">Email Draft</Label>
                <Textarea
                  id="email-draft"
                  placeholder="Start composing your email or provide instructions for AI..."
                  value={currentDraft}
                  onChange={(e) => setCurrentDraft(e.target.value)}
                  className="min-h-[200px] flex-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateEmail}
                  disabled={isLoading || !apiKeyLoaded || !hasApiKey}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Generate/Modify Email
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={!activeConversation || isLoading}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeConversation && activeConversation.messages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Conversation History</CardTitle>
              <CardDescription>Previous messages in this conversation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:max-h-[300px] overflow-y-auto p-2">
              {activeConversation.messages.map((message: any) => (
                <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[70%] p-3 rounded-lg",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-card-foreground border border-border",
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="block text-xs text-muted-foreground mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function EmailComposerPage() {
  return (
    <EmailConversationsProvider>
      <ComposerContent />
    </EmailConversationsProvider>
  )
}
