import { useState } from 'react'
import { useAuth } from '../../hooks/use-auth'
import { useComments, useAddComment, useDeleteComment } from '../../hooks/use-comments'
import { Espresso } from '../illustrations/Produce'
import { personColor } from '../../lib/person-color'

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

  const hasComments = (comments?.length ?? 0) > 0

  return (
    <section className="space-y-6">
      <div className="flex items-baseline gap-3">
        <h2 className="m-0 font-display italic text-2xl">Notes</h2>
        <span
          className="font-mono font-bold"
          style={{
            fontSize: 10,
            letterSpacing: '0.25em',
            color: 'var(--color-basil)',
          }}
        >
          I COMMENTI
        </span>
      </div>

      {/* Diary-style comment entries */}
      {hasComments ? (
        <div>
          {comments!.map((comment, i) => {
            const author = comment.profiles
            const isOwn = profile?.id === comment.author_id
            const isLast = i === comments!.length - 1
            const date = new Date(comment.created_at)

            return (
              <article key={comment.id} className="group py-4 sm:py-5">
                <p
                  className="font-display italic text-text leading-[1.55] m-0 mb-2.5 whitespace-pre-wrap"
                  style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)' }}
                >
                  “{comment.body}”
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="font-mono font-bold uppercase"
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.22em',
                      color: personColor(author),
                    }}
                  >
                    — {author.display_name}
                  </span>
                  <span
                    className="font-mono font-bold uppercase"
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.22em',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    ·{' '}
                    {date.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
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
                      className="ml-auto font-mono text-[10px] uppercase text-text-muted/40 hover:text-aubergine transition-colors opacity-0 group-hover:opacity-100 bg-transparent border-none cursor-pointer"
                      style={{ letterSpacing: '0.18em' }}
                    >
                      delete
                    </button>
                  )}
                </div>

                {!isLast && (
                  <div
                    className="mt-5 sm:mt-6"
                    style={{
                      height: 1,
                      background: 'var(--color-basil)',
                      opacity: 0.2,
                    }}
                  />
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 space-y-3">
          <Espresso size={56} className="mx-auto opacity-70" />
          <p className="font-display italic text-base text-text m-0">
            Ancora nessun pensiero.
          </p>
          <p className="font-mono text-xs text-text-muted m-0">
            no notes yet — start the conversation!
          </p>
        </div>
      )}

      {/* New comment form */}
      <form
        onSubmit={handleSubmit}
        className="bg-bg-card border border-border p-4 space-y-3 mt-2"
        style={{ borderRadius: 2 }}
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="add a note..."
          rows={2}
          className="w-full px-3 py-2 font-mono text-[13.5px] bg-bg text-text border border-border placeholder:text-text-muted/50 placeholder:italic focus:outline-none focus:border-tomato transition-colors resize-y"
          style={{ borderRadius: 2 }}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!body.trim() || addComment.isPending}
            className="btn-trat disabled:opacity-50"
          >
            posta
          </button>
        </div>
      </form>
    </section>
  )
}
