/**
 * Instagram helpers. Instagram blocks scraping, so instead of fetching a
 * recipe from the page we embed the post's video directly. Public posts,
 * reels, and TV all embed via the same /embed/captioned/ URL — no API key.
 */

// Matches /p/<id>/, /reel/<id>/, /reels/<id>/, /tv/<id>/ on instagram.com
const IG_RE =
  /instagram\.com\/(?:[^/]+\/)?(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i

export function isInstagramUrl(url: string): boolean {
  return IG_RE.test(url)
}

/** Extract the shortcode/post id from an Instagram URL, or null. */
export function instagramPostId(url: string): string | null {
  const m = url.match(IG_RE)
  return m ? m[1] : null
}

/** The embeddable iframe URL for a post id (captioned = includes the caption). */
export function instagramEmbedUrl(postId: string): string {
  return `https://www.instagram.com/p/${postId}/embed/captioned/`
}
