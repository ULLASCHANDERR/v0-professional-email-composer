// This ensures the AI SDK picks up the API key if the 'apiKey' parameter is not taking precedence.
// In a production environment, consider setting this as a proper environment variable.
import { generateText } from "ai"
import { google } from "@ai-sdk/google" // Using google for Gemini

export async function POST(req: Request) {
  try {
    const { text, geminiApiKey } = await req.json()

    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: "Gemini API key is missing." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!text || text.trim() === "") {
      return new Response(JSON.stringify({ error: "Input text cannot be empty." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("[v0] geminiApiKey received:", geminiApiKey ? "present" : "missing")

    process.env.GOOGLE_GENERATIVE_AI_API_KEY = geminiApiKey

    const { text: rephrasedText } = await generateText({
      model: google("gemini-2.0-flash"), // Removed apiKey parameter as it might be conflicting
      prompt: `Rephrase the following text to a professional tone, providing only the rephrased text without any additional suggestions or options:\\n\\n${text}`,
    })

    return new Response(JSON.stringify({ rephrasedText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("[v0] Rephrase API error:", error)
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
