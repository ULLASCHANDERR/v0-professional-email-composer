"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApiKey } from "@/hooks/use-api-key"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Key, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const { geminiApiKey, geminiApiUrl, saveApiKey, clearApiKey } = useApiKey()
  const { toast } = useToast()
  const [apiKeyInputValue, setApiKeyInputValue] = useState("")
  const [apiUrlInputValue, setApiUrlInputValue] = useState("")
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    if (geminiApiKey) {
      setApiKeyInputValue(geminiApiKey)
    }
    if (geminiApiUrl) {
      setApiUrlInputValue(geminiApiUrl)
    }
  }, [geminiApiKey, geminiApiUrl])

  const handleSave = () => {
    if (!apiKeyInputValue.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      })
      return
    }
    if (!apiUrlInputValue.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API URL",
        variant: "destructive",
      })
      return
    }

    saveApiKey(apiKeyInputValue.trim(), apiUrlInputValue.trim())
    toast({
      title: "Success",
      description: "API settings saved successfully",
    })
  }

  const handleClear = () => {
    clearApiKey()
    setApiKeyInputValue("")
    setApiUrlInputValue("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent") // Reset to default
    toast({
      title: "Success",
      description: "API settings cleared successfully",
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure your API key and URL to enable AI-powered features</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Configuration
          </CardTitle>
          <CardDescription>
            Enter your Gemini API key and endpoint URL to use the text processing features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(geminiApiKey || geminiApiUrl) && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              {geminiApiKey && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Current API Key:</span>
                    <code className="text-sm bg-background px-2 py-1 rounded">
                      {showKey ? geminiApiKey : "••••••••••••••••"}
                    </code>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowKey(!showKey)}>
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              )}
              {geminiApiUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Current API URL:</span>
                  <code className="text-sm bg-background px-2 py-1 rounded">{geminiApiUrl}</code>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="gemini-api-key">Gemini API Key</Label>
            <Input
              id="gemini-api-key"
              type="password"
              placeholder="Enter your Gemini API key..."
              value={apiKeyInputValue}
              onChange={(e) => setApiKeyInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave()
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gemini-api-url">Gemini API URL</Label>
            <Input
              id="gemini-api-url"
              type="text"
              placeholder="Enter your Gemini API URL..."
              value={apiUrlInputValue}
              onChange={(e) => setApiUrlInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave()
                }
              }}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save API Settings
            </Button>
            {(geminiApiKey || geminiApiUrl) && (
              <Button variant="destructive" onClick={handleClear} className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Note:</strong> Your API key and URL are stored locally in your browser and never sent to our
              servers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
