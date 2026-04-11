import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface ScrapedRecipe {
  title: string
  description: string | null
  ingredients: { amount: string; unit: string; item: string }[]
  steps: string[]
  servings: string | null
  image_url: string | null
  image_data?: string | null
  image_type?: string | null
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RecipeDiary/1.0)",
        "Accept": "text/html",
      },
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch URL: ${response.status}` }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    const html = await response.text()

    // Try to extract JSON-LD Recipe schema
    const recipe = extractJsonLdRecipe(html) ?? extractBasicRecipe(html, url)

    // Fetch and inline the image to avoid CORS issues on the client
    if (recipe.image_url) {
      try {
        const imgRes = await fetch(recipe.image_url, {
          headers: { "Accept": "image/*" },
        })
        if (imgRes.ok) {
          const buf = await imgRes.arrayBuffer()
          const bytes = new Uint8Array(buf)
          let binary = ""
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i])
          }
          recipe.image_data = btoa(binary)
          recipe.image_type = imgRes.headers.get("content-type") || "image/jpeg"
        }
      } catch {
        // Image fetch failed, client can still work without it
      }
    }

    return new Response(JSON.stringify(recipe), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
})

function extractJsonLdRecipe(html: string): ScrapedRecipe | null {
  // Find all JSON-LD script blocks
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      let data = JSON.parse(match[1].trim())

      // Handle @graph arrays (common in WordPress/Yoast)
      if (data["@graph"]) {
        data = data["@graph"]
      }

      // Normalize to array
      const items = Array.isArray(data) ? data : [data]

      for (const item of items) {
        if (item["@type"] === "Recipe" || (Array.isArray(item["@type"]) && item["@type"].includes("Recipe"))) {
          return parseSchemaRecipe(item)
        }
      }
    } catch {
      continue
    }
  }

  return null
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_match, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
}

function parseSchemaRecipe(schema: Record<string, unknown>): ScrapedRecipe {
  const title = decodeHtmlEntities(String(schema.name || ""))
  const description = schema.description ? decodeHtmlEntities(String(schema.description)) : null

  // Parse ingredients
  const rawIngredients = (schema.recipeIngredient || schema.ingredients || []) as string[]
  const ingredients = rawIngredients.map(parseIngredientString)

  // Parse steps
  let steps: string[] = []
  const rawInstructions = schema.recipeInstructions
  if (Array.isArray(rawInstructions)) {
    steps = rawInstructions.map((step) => {
      let text = ""
      if (typeof step === "string") text = step
      else if (step && typeof step === "object" && "text" in step) text = String(step.text)
      else if (step && typeof step === "object" && "itemListElement" in step) {
        const subSteps = step.itemListElement as Array<Record<string, unknown>>
        text = subSteps.map((s) => String(s.text || "")).join(" ")
      } else {
        text = String(step)
      }
      return decodeHtmlEntities(text)
    })
  } else if (typeof rawInstructions === "string") {
    steps = rawInstructions.split(/\n+/).filter(Boolean).map(decodeHtmlEntities)
  }

  // Parse servings
  let servings: string | null = null
  if (schema.recipeYield) {
    servings = Array.isArray(schema.recipeYield)
      ? String(schema.recipeYield[0])
      : String(schema.recipeYield)
  }

  // Parse image
  let image_url: string | null = null
  if (schema.image) {
    if (typeof schema.image === "string") {
      image_url = schema.image
    } else if (Array.isArray(schema.image)) {
      image_url = typeof schema.image[0] === "string" ? schema.image[0] : (schema.image[0] as Record<string, unknown>)?.url as string ?? null
    } else if (typeof schema.image === "object" && schema.image !== null && "url" in schema.image) {
      image_url = String((schema.image as Record<string, unknown>).url)
    }
  }

  return { title, description, ingredients, steps, servings, image_url }
}

function parseIngredientString(raw: string): { amount: string; unit: string; item: string } {
  const cleaned = decodeHtmlEntities(raw.replace(/<[^>]*>/g, "").trim())

  // Try to match: "1 1/2 cups flour" or "2 tbsp olive oil"
  const match = cleaned.match(
    /^([\d\s./½¼¾⅓⅔⅛]+)?\s*(cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g\b|kg|ml|liters?|litres?|pinch|dash|cloves?|bunch|cans?|packages?|pkg|large|medium|small|whole|sticks?)(?=\s|$)\s*[.,]?\s*(.+)/i,
  )

  if (match) {
    return {
      amount: (match[1] || "").trim(),
      unit: (match[2] || "").trim(),
      item: (match[3] || cleaned).trim(),
    }
  }

  return { amount: "", unit: "", item: cleaned }
}

function extractBasicRecipe(html: string, url: string): ScrapedRecipe {
  // Fallback: extract title from <title> or og:title
  let title = ""

  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
  if (ogTitleMatch) {
    title = ogTitleMatch[1]
  } else {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) {
      title = titleMatch[1].trim()
    }
  }

  // Try og:description
  let description: string | null = null
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
  if (ogDescMatch) {
    description = ogDescMatch[1]
  }

  // Try og:image
  let image_url: string | null = null
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
  if (ogImageMatch) {
    image_url = ogImageMatch[1]
  }

  return {
    title: title || new URL(url).hostname,
    description,
    ingredients: [],
    steps: [],
    servings: null,
    image_url,
  }
}
