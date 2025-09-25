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
  const { geminiApiKey, saveApiKey, clearApiKey } = useApiKey()
  const { toast } = useToast()
  // IMPORTANT: This is a temporary change. Remove this hardcoded key after the user saves it.
  const [apiKeyInputValue, setApiKeyInputValue] = useState(geminiApiKey || "AIzaSyB-zwLD3t35VgvTzzhA3Kun5ew9OyDRf1M")
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    if (geminiApiKey) {
      setApiKeyInputValue(geminiApiKey)
    }
  }, [geminiApiKey])

  const handleSave = () => {
    if (!apiKeyInputValue.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Gemini API key",
        variant: "destructive",
      })
      return
    }

    saveApiKey(apiKeyInputValue.trim())
    toast({
      title: "Success",
      description: "Gemini API key saved successfully",
    })
  }

  const handleClear = () => {
    clearApiKey()
    setApiKeyInputValue("")
    toast({
      title: "Success",
      description: "Gemini API key cleared successfully",
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure your Gemini API key to enable AI-powered features</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Gemini API Configuration
          </CardTitle>
          <CardDescription>
            Enter your Gemini API key to use the text processing features with the Gemini 2.0 Flash model.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {geminiApiKey && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Current Gemini API Key:</span>
                  <code className="text-sm bg-background px-2 py-1 rounded">
                    {showKey ? geminiApiKey : "••••••••••••••••"}
                  </code>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowKey(!showKey)}>
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
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

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save API Key
            </Button>
            {geminiApiKey && (
              <Button variant="destructive" onClick={handleClear} className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Note:</strong> Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
