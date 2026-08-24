import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface ImageInput {
  data: string
  media_type?: string
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const body = await req.json()

    // Support both single image and multiple images
    let images: ImageInput[]
    if (body.images && Array.isArray(body.images)) {
      images = body.images
    } else if (body.image) {
      images = [{ data: body.image, media_type: body.media_type }]
    } else {
      return new Response(
        JSON.stringify({ error: "image or images[] is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    // Build content array: all images first, then the prompt
    const content: Record<string, unknown>[] = images.map((img) => ({
      type: "image",
      source: {
        type: "base64",
        media_type: img.media_type || "image/jpeg",
        data: img.data,
      },
    }))

    const photoWord = images.length === 1 ? "this image" : "these images"

    content.push({
      type: "text",
      text: `Extract the recipe from ${photoWord}. The images are pages/photos of the same recipe. Return ONLY valid JSON with this exact structure, no other text:

{
  "title": "Recipe title",
  "description": "Brief description or null",
  "ingredients": [
    { "amount": "1", "unit": "cup", "item": "flour" }
  ],
  "steps": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "servings": "4" or null
}

Rules:
- Combine information across all images into a single recipe.
- Extract all ingredients with amount, unit, and item separated. If amount/unit aren't clear, leave them as empty strings.
- Extract all steps as an ordered array of strings.
- If the images are not a recipe or are unreadable, return: { "error": "Could not extract a recipe from this image" }
- Preserve the original language of the recipe.
- Return ONLY the JSON object, no markdown fences or extra text.`,
    })

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        messages: [{ role: "user", content }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error("Claude API error:", err)
      return new Response(
        JSON.stringify({ error: "Failed to process image" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    const result = await response.json()
    const text = result.content?.[0]?.text || ""

    // Parse the JSON from Claude's response
    let recipe
    try {
      // Strip markdown fences if present
      const cleaned = text.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "").trim()
      recipe = JSON.parse(cleaned)
    } catch {
      return new Response(
        JSON.stringify({ error: "Could not parse recipe from image" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    // If Claude returned an error message
    if (recipe.error) {
      return new Response(
        JSON.stringify({ error: recipe.error }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    // Normalize to match scrape-recipe shape
    const normalized = {
      title: recipe.title || "",
      description: recipe.description || null,
      ingredients: Array.isArray(recipe.ingredients)
        ? recipe.ingredients.map((ing: Record<string, string>) => ({
            amount: String(ing.amount || ""),
            unit: String(ing.unit || ""),
            item: String(ing.item || ""),
          }))
        : [],
      steps: Array.isArray(recipe.steps) ? recipe.steps.map(String) : [],
      servings: recipe.servings || null,
      image_url: null,
    }

    return new Response(JSON.stringify(normalized), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})
