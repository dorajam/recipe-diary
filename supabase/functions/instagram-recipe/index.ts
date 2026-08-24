import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

interface Result {
  caption: string | null
  title: string
  description: string | null
  ingredients: { amount: string; unit: string; item: string }[]
  steps: string[]
  servings: string | null
  error?: string
}

/**
 * Reads a public Instagram reel's CAPTION via the oEmbed endpoint (no login,
 * no API key), then uses Claude to structure any recipe in it into
 * ingredients + steps. Reels without a recipe in the caption return empty
 * lists — that's expected (the recipe may only be in the video).
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const json = (body: Partial<Result>, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  try {
    const { url } = await req.json()
    if (!url || typeof url !== "string") {
      return json({ error: "URL required" }, 400)
    }

    // 1. Fetch the caption via oEmbed.
    const caption = await fetchCaption(url)
    if (!caption) {
      return json({
        caption: null,
        title: "",
        description: null,
        ingredients: [],
        steps: [],
        servings: null,
      })
    }

    // 2. Structure it with Claude.
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
    if (!apiKey) {
      // No key — still return the raw caption so the client can use it.
      return json({
        caption,
        title: "",
        description: null,
        ingredients: [],
        steps: [],
        servings: null,
      })
    }

    const prompt = `Below is the caption of an Instagram cooking reel. Extract the recipe from it.
Return ONLY valid JSON with this exact structure, no other text:

{
  "title": "short recipe name, or empty string if unclear",
  "ingredients": [
    { "amount": "1", "unit": "cup", "item": "flour" }
  ],
  "steps": [
    "First step text",
    "Second step text"
  ],
  "servings": "e.g. 4, or empty string if not mentioned"
}

Rules:
- Split each ingredient into amount, unit, and item. If amount/unit aren't given, use empty strings (e.g. an ingredient like "Mackerel" → {"amount":"","unit":"","item":"mackerel"}).
- Steps are an ordered array of instruction strings. If the caption describes the method as prose, break it into logical steps.
- If the caption clearly contains NO recipe (just a comment, hashtags, or promo), return {"ingredients":[],"steps":[],"title":"","servings":""}.
- Return ONLY the JSON object, no markdown fences or extra text.

Caption:
"""
${caption}
"""`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!response.ok) {
      console.error("Claude API error:", await response.text())
      // Still return the caption so the user has something.
      return json({
        caption,
        title: "",
        description: null,
        ingredients: [],
        steps: [],
        servings: null,
      })
    }

    const result = await response.json()
    const text = result.content?.[0]?.text || ""

    let parsed: Record<string, unknown>
    try {
      const cleaned = text
        .replace(/^```json?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim()
      parsed = JSON.parse(cleaned)
    } catch {
      return json({
        caption,
        title: "",
        description: null,
        ingredients: [],
        steps: [],
        servings: null,
      })
    }

    return json({
      caption,
      title: String(parsed.title || ""),
      description: null,
      ingredients: Array.isArray(parsed.ingredients)
        ? (parsed.ingredients as Record<string, string>[]).map((ing) => ({
            amount: String(ing.amount || ""),
            unit: String(ing.unit || ""),
            item: String(ing.item || ""),
          }))
        : [],
      steps: Array.isArray(parsed.steps)
        ? (parsed.steps as unknown[]).map(String)
        : [],
      servings: parsed.servings ? String(parsed.servings) : null,
    })
  } catch (err) {
    return json({ error: (err as Error).message }, 500)
  }
})

/** Get the caption text of a public reel via the oEmbed endpoint. */
async function fetchCaption(postUrl: string): Promise<string | null> {
  try {
    const oembed = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(postUrl)}`
    const res = await fetch(oembed, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RecipeDiary/1.0)",
        Accept: "application/json",
      },
    })
    if (!res.ok) return null
    const data = await res.json()
    // oEmbed puts the caption in `title`.
    const t = typeof data?.title === "string" ? data.title.trim() : ""
    return t || null
  } catch {
    return null
  }
}
