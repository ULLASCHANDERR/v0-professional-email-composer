"use client"

import { useState, useEffect } from "react"

const GEMINI_API_KEY_STORAGE_KEY = "ai-text-app-gemini-api-key"

export function useApiKey() {
  const [geminiApiKey, setGeminiApiKey] = useState<string>("")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    console.log("[v0] useApiKey: Attempting to load API key from localStorage.")
    const storedKey = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY)
    if (storedKey) {
      setGeminiApiKey(storedKey)
      console.log("[v0] useApiKey: API key loaded from localStorage. Value:", storedKey)
    } else {
      console.log("[v0] useApiKey: No API key found in localStorage. Value:", storedKey)
    }
    setIsLoaded(true)
    console.log("[v0] useApiKey: isLoaded set to true.")
  }, [])

  const saveApiKey = (key: string) => {
    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, key)
    setGeminiApiKey(key)
    console.log("[v0] useApiKey: API key saved. Value:", key)
  }

  const clearApiKey = () => {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY)
    setGeminiApiKey("")
  }

  return {
    geminiApiKey,
    isLoaded,
    saveApiKey,
    clearApiKey,
  }
}
