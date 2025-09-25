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
import { useEmailConversations, type EmailMessage } from "@/hooks/use-email-conversations"
import { Loader2, Send, Save, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

export default function EmailComposerPage() {
  const { geminiApiKey, isLoaded: apiKeyLoaded } = useApiKey()
  const hasApiKey = geminiApiKey.length > 0
  const {
    conversations,
    activeConversation,
    setActiveConversationId,
    createNewConversation,
    updateConversation,
    addMessageToConversation,
    isLoaded: conversationsLoaded,
  } = useEmailConversations()
  const { toast } = useToast()

  const [subject, setSubject] = useState(activeConversation?.subject || "")
  const [currentDraft, setCurrentDraft] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (conversationsLoaded && !activeConversation && conversations.length > 0) {
      setActiveConversationId(conversations[0].id)
    } else if (conversationsLoaded && conversations.length === 0) {
      const newConv = createNewConversation()
      setActiveConversationId(newConv.id)
    }
  }, [conversationsLoaded, activeConversation, conversations, setActiveConversationId, createNewConversation])

  useEffect(() => {
    if (activeConversation) {
      setSubject(activeConversation.subject)
      // Set current draft to the last AI message or empty if new
      const lastAiMessage = activeConversation.messages.filter((msg) => msg.role === "ai").pop()
      setCurrentDraft(lastAiMessage ? lastAiMessage.content : "")
    } else {
      setSubject("New Email Conversation")
      setCurrentDraft("")
    }
  }, [activeConversation])

  const handleGenerateEmail = async () => {
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
      console.log("[v0] Client-side apiKey before fetch:", geminiApiKey)
      const response = await fetch("/api/compose-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation: activeConversation?.messages || [],
          currentDraft,
          apiKey: geminiApiKey, // Use geminiApiKey directly
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to compose email.")
      }

      const generatedEmail = data.generatedEmail

      if (activeConversation) {
        // Add user input as a message
        addMessageToConversation(activeConversation.id, "user", currentDraft)
        // Add AI response as a message
        addMessageToConversation(activeConversation.id, "ai", generatedEmail)
        // Update the current draft with the AI's output
        setCurrentDraft(generatedEmail)
        // Update subject if it's still default
        if (activeConversation.subject === "New Email Conversation" && generatedEmail.length > 0) {
          const firstLine = generatedEmail.split("\n")[0].substring(0, 50) + "..."
          updateConversation({ ...activeConversation, subject: firstLine })
        }
      } else {
        // This case should ideally not happen due to useEffect, but as a fallback
        const newConv = createNewConversation()
        addMessageToConversation(newConv.id, "user", currentDraft)
        addMessageToConversation(newConv.id, "ai", generatedEmail)
        setCurrentDraft(generatedEmail)
        if (generatedEmail.length > 0) {
          const firstLine = generatedEmail.split("\n")[0].substring(0, 50) + "..."
          updateConversation({ ...newConv, subject: firstLine })
        }
      }

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
      // Ensure the current draft is saved as the latest AI message if it's not already
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
    <div className="flex h-full">
      <div className="flex-1 flex flex-col p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Email Composer</h1>
          <p className="text-muted-foreground">
            Compose, modify, and manage your email conversations with AI assistance.
          </p>
        </div>

        {apiKeyLoaded && <ApiKeyWarning />}

        {activeConversation && (
          <Card className="flex-1 flex flex-col">
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
                      <Send className="mr-2 h-4 w-4" />
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

              {activeConversation.messages.length > 0 && (
                <div className="space-y-4 max-h-[300px] overflow-y-auto p-4 border rounded-md bg-muted/20">
                  <h3 className="text-lg font-semibold">Conversation History</h3>
                  {activeConversation.messages.map((message: EmailMessage) => (
                    <div
                      key={message.id}
                      className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                    >
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
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
