import { generateText } from "ai"
import { google } from "@ai-sdk/google" // Using google for Gemini

export async function POST(req: Request) {
  try {
    const { text, geminiApiKey, geminiApiUrl } = await req.json()

    if (!geminiApiKey || !geminiApiUrl) {
      return new Response(JSON.stringify({ error: "Gemini API key or URL is missing." }), {
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

    const { text: rephrasedText } = await generateText({
      model: google("gemini-2.0-flash", {
        apiKey: geminiApiKey,
        baseURL: geminiApiUrl.split("/v1beta")[0], // Extract base URL
      }),
      prompt: `Rephrase the following text to a professional tone, providing only the rephrased text without any additional suggestions or options:\\n\\n${text}`,
      maxOutputTokens: 2000,
      temperature: 0.7,
      topP: 1, // Ensure single output
      frequencyPenalty: 0,
      presencePenalty: 0,
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
