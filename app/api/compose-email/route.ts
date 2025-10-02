// Using direct HTTP call to Google Generative Language API (v1beta)
import type { EmailMessage } from "@/hooks/use-email-conversations"

export async function POST(req: Request) {
  try {
    const { conversation, currentDraft } = (await req.json()) as {
      conversation: EmailMessage[]
      currentDraft: string
    }

    if (!currentDraft.trim() && conversation.length === 0) {
      return new Response(JSON.stringify({ error: "Input text or conversation cannot be empty." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Google Generative AI API key is missing." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

    const prompt = `Create a professional email based on the following:Context:${conversation.map((msg) => msg.content).join("\n")}Current draft/instruction:"${currentDraft}"Requirements:- Correct grammar, spelling, and tone- Proper greeting, body, and closing- Return ONLY the final email text, no extra commentaryEmail:`

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
          topP: 1,
          topK: 40,
        },
      }),
    })

    if (!resp.ok) {
      const errorBody = await resp.text()
      throw new Error(`Gemini API error: ${errorBody}`)
    }

    const data = await resp.json()
    const candidates = data?.candidates || []
    const first = candidates[0]
    const parts = first?.content?.parts || []
    const generatedEmail = parts
      .map((p: any) => p?.text)
      .filter(Boolean)
      .join("\n")
      .trim()

    if (!generatedEmail) {
      throw new Error("Empty response from Gemini API")
    }

    return new Response(JSON.stringify({ generatedEmail }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("[v0] Compose Email API error:", error)
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
