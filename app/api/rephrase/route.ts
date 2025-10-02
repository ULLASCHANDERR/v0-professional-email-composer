// Using direct HTTP call to Google Generative Language API (v1beta)

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text || text.trim() === "") {
      return new Response(JSON.stringify({ error: "Input text cannot be empty." }), {
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

    // New prompt template
    const prompt = `Rephrase the following text in clear, concise, professional English.
Ensure perfect grammar, spelling, and punctuation.
Return only the rephrased text.
Original:"${text}"
Rephrased:`

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
    const rephrasedText = parts
      .map((p: any) => p?.text)
      .filter(Boolean)
      .join("\n")
      .trim()

    if (!rephrasedText) {
      throw new Error("Empty response from Gemini API")
    }

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
