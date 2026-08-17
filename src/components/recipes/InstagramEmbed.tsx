import { instagramEmbedUrl } from '../../lib/instagram'

/**
 * Embeds an Instagram post/reel by its shortcode. Uses Instagram's public
 * /embed/captioned/ iframe — works for public posts without login or API key.
 */
export function InstagramEmbed({ postId }: { postId: string }) {
  return (
    <div
      className="w-full"
      style={{ maxWidth: 300 }}
    >
      <iframe
        title="Instagram reel"
        src={instagramEmbedUrl(postId)}
        loading="lazy"
        allow="encrypted-media; clipboard-write"
        allowFullScreen
        scrolling="no"
        className="w-full bg-bg-card border border-border"
        style={{ height: 540, borderRadius: 4 }}
      />
    </div>
  )
}
