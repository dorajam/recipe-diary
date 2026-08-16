import { instagramEmbedUrl } from '../../lib/instagram'

/**
 * Embeds an Instagram post/reel by its shortcode. Uses Instagram's public
 * /embed/captioned/ iframe — works for public posts without login or API key.
 */
export function InstagramEmbed({ postId }: { postId: string }) {
  return (
    <div
      className="mx-auto w-full"
      style={{ maxWidth: 400 }}
    >
      <iframe
        title="Instagram reel"
        src={instagramEmbedUrl(postId)}
        loading="lazy"
        allow="encrypted-media; clipboard-write"
        allowFullScreen
        scrolling="no"
        className="w-full bg-bg-card border border-border"
        style={{ height: 680, borderRadius: 4 }}
      />
    </div>
  )
}
