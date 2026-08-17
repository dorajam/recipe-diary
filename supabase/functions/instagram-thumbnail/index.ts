import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

interface ThumbResult {
  image_data: string | null
  image_type: string | null
  error?: string
}

/**
 * Grabs the cover image of a public Instagram post/reel and returns it
 * inlined as base64. The browser can't do this (cross-origin), but a server
 * can read the post's og:image / oEmbed thumbnail. This is the reel's cover
 * frame, not an arbitrary moment.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const json = (body: ThumbResult, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  try {
    const { url } = await req.json()
    if (!url || typeof url !== "string") {
      return json({ image_data: null, image_type: null, error: "URL required" }, 400)
    }

    const imageUrl = await findThumbnailUrl(url)
    if (!imageUrl) {
      return json({
        image_data: null,
        image_type: null,
        error: "No thumbnail found (post may be private).",
      })
    }

    // Inline the image as base64.
    const imgRes = await fetch(imageUrl, { headers: { Accept: "image/*" } })
    if (!imgRes.ok) {
      return json({ image_data: null, image_type: null, error: "Image fetch failed." })
    }
    const buf = await imgRes.arrayBuffer()
    const bytes = new Uint8Array(buf)
    let binary = ""
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])

    return json({
      image_data: btoa(binary),
      image_type: imgRes.headers.get("content-type") || "image/jpeg",
    })
  } catch (err) {
    return json({
      image_data: null,
      image_type: null,
      error: err instanceof Error ? err.message : "Unknown error",
    })
  }
})

/** Try oEmbed first, then fall back to scraping og:image from the page HTML. */
async function findThumbnailUrl(postUrl: string): Promise<string | null> {
  // 1. Instagram's public oEmbed endpoint (no auth) returns thumbnail_url.
  try {
    const oembed = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(postUrl)}`
    const res = await fetch(oembed, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RecipeDiary/1.0)",
        Accept: "application/json",
      },
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.thumbnail_url) return data.thumbnail_url as string
    }
  } catch {
    // fall through to HTML scrape
  }

  // 2. Fetch the post page and read the og:image meta tag.
  try {
    const res = await fetch(postUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html",
      },
    })
    if (res.ok) {
      const html = await res.text()
      const m =
        html.match(
          /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
        ) ||
        html.match(
          /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
        )
      if (m) return decodeHtmlEntities(m[1])
    }
  } catch {
    // give up
  }

  return null
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}
