"use client"

type HistoryType = "compose" | "rephrase"

export type ApiHistoryItem = {
  id: string
  type: HistoryType
  timestamp: number
  model?: string
  // store inputs/outputs so they can be reused
  currentDraft?: string // for compose: the generated email; for rephrase: the rephrased result
  conversation?: Array<{ role: string; content: string }>
  inputText?: string // for rephrase: original text
}

const KEY = "ai:api-history"

export function getApiHistory(): ApiHistoryItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ApiHistoryItem[]) : []
  } catch {
    return []
  }
}

export function addApiHistory(item: ApiHistoryItem) {
  if (typeof window === "undefined") return
  const prev = getApiHistory()
  const next = [item, ...prev].slice(0, 100) // cap history
  window.localStorage.setItem(KEY, JSON.stringify(next))
}

// Payload handoff to composer from Settings
export function setComposerLoadPayload(payload: {
  currentDraft?: string
  conversation?: Array<{ role: string; content: string }>
}) {
  if (typeof window === "undefined") return
  window.localStorage.setItem("ai:composer-load", JSON.stringify(payload))
}

export function getComposerLoadPayload(): {
  currentDraft?: string
  conversation?: Array<{ role: string; content: string }>
} | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem("ai:composer-load")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearComposerLoadPayload() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem("ai:composer-load")
}
