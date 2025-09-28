"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Copy, Loader2, Type } from "lucide-react"

export default function RephrasePage() {
  const { toast } = useToast()
  const [inputText, setInputText] = useState("")
  const [rephrasedText, setRephrasedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRephrase = async () => {

    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Input text cannot be empty.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setRephrasedText("")

    try {
      const response = await fetch("/api/rephrase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to rephrase text.")
      }

      setRephrasedText(data.rephrasedText)
      toast({
        title: "Success",
        description: "Text rephrased successfully!",
      })
    } catch (error: any) {
      console.error("[v0] Rephrase error:", error)
      const errorMessage = error.message || "An unexpected error occurred during rephrasing."
      setRephrasedText(`Error: ${errorMessage}`)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (rephrasedText) {
      navigator.clipboard.writeText(rephrasedText)
      toast({
        title: "Copied!",
        description: "Rephrased text copied to clipboard.",
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rephrase Text</h1>
        <p className="text-muted-foreground">Transform your casual text into a professional tone using AI.</p>
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Text Rephraser
          </CardTitle>
          <CardDescription>
            Enter your text below and click &quot;Rephrase&quot; to get a professional version.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="input-text">Original Text</Label>
            <Textarea
              id="input-text"
              placeholder="Enter text to rephrase..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              className="min-h-[150px]"
            />
          </div>

          <Button onClick={handleRephrase} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rephrasing...
              </>
            ) : (
              "Rephrase"
            )}
          </Button>

          {rephrasedText && (
            <div className="space-y-2">
              <Label htmlFor="output-text">Rephrased Text</Label>
              <div className="relative">
                <Textarea id="output-text" value={rephrasedText} readOnly rows={8} className="min-h-[150px] pr-12" />
                <Button variant="ghost" size="icon" onClick={handleCopy} className="absolute top-2 right-2">
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
