"use client"

import { useState, useEffect } from "react"

const GEMINI_API_KEY_STORAGE_KEY = "ai-text-app-gemini-api-key"
const GEMINI_API_URL_STORAGE_KEY = "ai-text-app-gemini-api-url"
const DEFAULT_GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

export function useApiKey() {
  const [geminiApiKey, setGeminiApiKey] = useState<string>("")
  const [geminiApiUrl, setGeminiApiUrl] = useState<string>(DEFAULT_GEMINI_API_URL)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const storedKey = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY)
    if (storedKey) {
      setGeminiApiKey(storedKey)
    }
    const storedUrl = localStorage.getItem(GEMINI_API_URL_STORAGE_KEY)
    if (storedUrl) {
      setGeminiApiUrl(storedUrl)
    } else {
      setGeminiApiUrl(DEFAULT_GEMINI_API_URL)
    }
    setIsLoaded(true)
  }, [])

  const saveApiKey = (key: string, url: string) => {
    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, key)
    setGeminiApiKey(key)
    localStorage.setItem(GEMINI_API_URL_STORAGE_KEY, url)
    setGeminiApiUrl(url)
  }

  const clearApiKey = () => {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY)
    setGeminiApiKey("")
    localStorage.removeItem(GEMINI_API_URL_STORAGE_KEY)
    setGeminiApiUrl(DEFAULT_GEMINI_API_URL)
  }

  return {
    geminiApiKey,
    geminiApiUrl,
    isLoaded,
    hasApiKey: geminiApiKey.length > 0,
    saveApiKey,
    clearApiKey,
  }
}
