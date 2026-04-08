import { useState } from 'react'
import { useAuth } from '../../hooks/use-auth'
import { useComments, useAddComment, useDeleteComment } from '../../hooks/use-comments'

interface CommentThreadProps {
  recipeId: string
}

export function CommentThread({ recipeId }: CommentThreadProps) {
  const { profile } = useAuth()
  const { data: comments } = useComments(recipeId)
  const addComment = useAddComment()
  const deleteComment = useDeleteComment()
  const [body, setBody] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile || !body.trim()) return

    await addComment.mutateAsync({
      recipeId,
      authorId: profile.id,
      body: body.trim(),
    })
    setBody('')
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl mb-6">Notes & Chat</h2>

      {/* Comment list */}
      {comments?.length ? (
        <div className="space-y-6">
          {comments.map((comment) => {
            const author = comment.profiles
            const isOwn = profile?.id === comment.author_id

            return (
              <div key={comment.id} className="flex gap-3 group">
                {author.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt=""
                    className="w-7 h-7 rounded-full shrink-0 mt-0.5"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: author.accent_colour }}
                  >
                    {author.display_name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: author.accent_colour }}
                    >
                      {author.display_name}
                    </span>
                    <span className="text-xs text-text-muted/50">
                      {new Date(comment.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    {isOwn && (
                      <button
                        onClick={() =>
                          deleteComment.mutate({
                            commentId: comment.id,
                            recipeId,
                          })
                        }
                        className="text-xs text-text-muted/30 hover:text-accent
                          transition-colors opacity-0 group-hover:opacity-100
                          bg-transparent border-none cursor-pointer"
                      >
                        delete
                      </button>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed m-0 mt-0.5">
                    {comment.body}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-text-muted">No comments yet.</p>
      )}

      {/* New comment form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card
            text-sm focus:outline-none focus:border-accent resize-y
            placeholder:text-text-muted/50"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!body.trim() || addComment.isPending}
            className="px-5 py-2 rounded-xl bg-accent text-white text-sm font-medium
              hover:opacity-90 transition-opacity disabled:opacity-50
              cursor-pointer border-none"
          >
            Post
          </button>
        </div>
      </form>
    </section>
  )
}
