import { generateText } from "ai"
import { google } from "@ai-sdk/google" // Using google for Gemini
import type { EmailMessage } from "@/hooks/use-email-conversations"

export async function POST(req: Request) {
  try {
    const { conversation, currentDraft, geminiApiKey, geminiApiUrl } = (await req.json()) as {
      conversation: EmailMessage[]
      currentDraft: string
      geminiApiKey: string
      geminiApiUrl: string
    }

    if (!geminiApiKey || !geminiApiUrl) {
      return new Response(JSON.stringify({ error: "Gemini API key or URL is missing." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!currentDraft.trim() && conversation.length === 0) {
      return new Response(JSON.stringify({ error: "Input text or conversation cannot be empty." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const messages = conversation.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Add the current draft as the latest user message for context
    messages.push({ role: "user", content: currentDraft })

    const { text: generatedEmail } = await generateText({
      model: google("gemini-2.0-flash", {
        apiKey: geminiApiKey,
        baseURL: geminiApiUrl.split("/v1beta")[0], // Extract base URL
      }),
      prompt: `You are an AI assistant that helps compose and modify professional emails.
      Based on the following conversation history and the current draft, generate or modify the email to be professional and coherent.
      If the user provides a new instruction, incorporate it into the email.
      If the user is continuing a thread, ensure the tone and context are maintained.
      Provide only the complete, polished email without any additional suggestions or options.
      
      Conversation history:
      ${messages.map((msg) => `${msg.role}: ${msg.content}`).join("\\n")}
      
      Current draft/instruction:
      ${currentDraft}
      
      Please provide the complete, polished email.`,
      maxOutputTokens: 2000,
      temperature: 0.7,
      topP: 1, // Ensure single output
      frequencyPenalty: 0,
      presencePenalty: 0,
    })

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
