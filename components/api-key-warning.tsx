"use client"

import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useApiKey } from "@/hooks/use-api-key"

export function ApiKeyWarning() {
  const { geminiApiKey, geminiApiUrl, isLoaded } = useApiKey()

  if (!isLoaded || (geminiApiKey && geminiApiUrl)) {
    return null
  }

  return (
    <Alert className="mb-6 border-destructive/50 bg-destructive/10">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Gemini API key and URL are required to use this feature.</span>
        <Button asChild variant="outline" size="sm">
          <Link href="/settings">Configure API Settings</Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
