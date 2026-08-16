import { useState } from 'react'
import { useAuth } from '../../hooks/use-auth'
import { useCookLog, useAddCookLog, useDeleteCookLog, useCookLogReactions, useToggleReaction } from '../../hooks/use-cook-log'
import { useSetRecipeStatus, useRecipeStatus } from '../../hooks/use-recipe-status'
import { STAGE_ORDER } from '../../lib/pipeline'
import { RollingPin } from '../illustrations/Produce'
import { personColor } from '../../lib/person-color'

const REACTION_EMOJIS = ['\u{1F60B}', '\u{1F525}', '\u{2764}\u{FE0F}', '\u{1F44F}', '\u{1F924}']

interface CookLogSectionProps {
  recipeId: string
}

function parseLocalDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00')
}

export function CookLogSection({ recipeId }: CookLogSectionProps) {
  const { profile } = useAuth()
  const { data: logs } = useCookLog(recipeId)
  const addLog = useAddCookLog()
  const deleteLog = useDeleteCookLog()
  const setStatus = useSetRecipeStatus()
  const { data: currentStatus } = useRecipeStatus(recipeId, profile?.id)
  const logIds = logs?.map((l) => l.id) || []

  // Logging a cook advances the recipe to 'cooked' — but never downgrades
  // one that's already a book candidate.
  function markCooked() {
    if (!profile) return
    if (currentStatus && STAGE_ORDER[currentStatus] >= STAGE_ORDER.cooked) return
    setStatus.mutate({ recipeId, userId: profile.id, status: 'cooked' })
  }

  // Delete a cook-log entry. If it was the last one and the recipe is still
  // at 'cooked' (not promoted to candidate), revert to 'planned' — a true undo.
  function handleDeleteLog(logId: string) {
    if (!profile) return
    const remaining = (logs?.length ?? 0) - 1
    deleteLog.mutate({ logId, recipeId })
    if (remaining <= 0 && currentStatus === 'cooked') {
      setStatus.mutate({ recipeId, userId: profile.id, status: 'planned' })
    }
  }

  const { data: reactions } = useCookLogReactions(logIds)
  const toggleReaction = useToggleReaction()

  const [showForm, setShowForm] = useState(false)
  const [cookedOn, setCookedOn] = useState(() => new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [changes, setChanges] = useState('')
  const [rating, setRating] = useState<number | null>(null)

  async function handleQuickLog() {
    if (!profile) return

    await addLog.mutateAsync({
      recipeId,
      cookedBy: profile.id,
      cookedOn: new Date().toISOString().split('T')[0],
    })

    markCooked()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    await addLog.mutateAsync({
      recipeId,
      cookedBy: profile.id,
      cookedOn,
      note: note.trim() || undefined,
      changes: changes.trim() || undefined,
      rating,
    })

    markCooked()

    setNote('')
    setChanges('')
    setRating(null)
    setShowForm(false)
  }

  const hasLogs = (logs?.length ?? 0) > 0

  return (
    <section className="space-y-6">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-3">
          <h2 className="m-0 font-display italic text-2xl">Cook log</h2>
          <span
            className="font-mono font-bold"
            style={{
              fontSize: 10,
              letterSpacing: '0.25em',
              color: 'var(--color-tomato)',
            }}
          >
            LE COTTURE
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleQuickLog}
            disabled={addLog.isPending}
            className={hasLogs ? 'btn-trat' : 'btn-trat btn-trat-ghost'}
          >
            I made it!
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="font-display italic text-sm cursor-pointer bg-transparent border-none px-2"
            style={{ color: 'var(--color-basil)' }}
          >
            {showForm ? 'cancel' : '+ with details'}
          </button>
        </div>
      </div>

      {/* Expanded form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-bg-card border border-border p-4 sm:p-5 space-y-3"
          style={{ borderRadius: 2 }}
        >
          <div>
            <div
              className="font-mono font-bold mb-1.5"
              style={{
                fontSize: 9,
                letterSpacing: '0.22em',
                color: 'var(--color-text-muted)',
              }}
            >
              DATE · LA DATA
            </div>
            <input
              type="date"
              value={cookedOn}
              onChange={(e) => setCookedOn(e.target.value)}
              className="px-3 py-2 font-mono text-[13px] bg-bg text-text border border-border focus:outline-none focus:border-tomato transition-colors"
              style={{ borderRadius: 2 }}
            />
          </div>

          <div>
            <div
              className="font-mono font-bold mb-1.5"
              style={{
                fontSize: 9,
                letterSpacing: '0.22em',
                color: 'var(--color-text-muted)',
              }}
            >
              RATING · IL VOTO
            </div>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div>
            <div
              className="font-mono font-bold mb-1.5"
              style={{
                fontSize: 9,
                letterSpacing: '0.22em',
                color: 'var(--color-text-muted)',
              }}
            >
              NOTES · APPUNTI
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="how did it turn out?"
              className="w-full px-3 py-2 font-mono text-[13px] bg-bg text-text border border-border placeholder:text-text-muted/50 placeholder:italic focus:outline-none focus:border-tomato transition-colors resize-y"
              style={{ borderRadius: 2 }}
            />
          </div>

          <div>
            <div
              className="font-mono font-bold mb-1.5"
              style={{
                fontSize: 9,
                letterSpacing: '0.22em',
                color: 'var(--color-basil)',
              }}
            >
              WHAT I CHANGED · LE MODIFICHE
            </div>
            <textarea
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              rows={2}
              placeholder="tweaks for next time — more garlic, less salt, baked 5 min longer…"
              className="w-full px-3 py-2 font-mono text-[13px] bg-bg text-text border border-border placeholder:text-text-muted/50 placeholder:italic focus:outline-none focus:border-tomato transition-colors resize-y"
              style={{ borderRadius: 2 }}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={addLog.isPending}
              className="btn-trat disabled:opacity-50"
            >
              save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="font-mono text-[11px] uppercase font-bold text-text-muted hover:text-text cursor-pointer bg-transparent border-none"
              style={{ letterSpacing: '0.2em' }}
            >
              cancel
            </button>
          </div>
        </form>
      )}

      {/* Diary entries — date stamp left, body right, hairline divider */}
      {hasLogs ? (
        <div>
          {logs!.map((log, i) => {
            const author = log.profiles
            const isOwn = profile?.id === log.cooked_by
            const date = parseLocalDate(log.cooked_on)
            const isLast = i === logs!.length - 1

            return (
              <article key={log.id} className="group">
                <div className="grid grid-cols-[44px_1fr] sm:grid-cols-[56px_1fr] gap-4 sm:gap-5 py-5">
                  {/* Date stamp */}
                  <div className="text-right pt-1">
                    <div
                      className="font-display italic font-medium leading-[0.9]"
                      style={{
                        fontSize: 32,
                        color: 'var(--color-tomato)',
                      }}
                    >
                      {date.getDate()}
                    </div>
                    <div
                      className="font-display italic mt-0.5 lowercase leading-none"
                      style={{ fontSize: 13, color: 'var(--color-text-muted)' }}
                    >
                      {date.toLocaleDateString('en-GB', { month: 'short' }).toLowerCase()}{' '}
                      {date.getFullYear()}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="min-w-0">
                    {log.rating != null && (
                      <div className="mb-2">
                        <StarRating value={log.rating} readOnly size={16} />
                      </div>
                    )}

                    {log.note ? (
                      <p
                        className="font-display italic text-text leading-[1.5] m-0 mb-2"
                        style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)' }}
                      >
                        “{log.note}”
                      </p>
                    ) : !log.changes && log.rating == null ? (
                      <p className="font-display italic text-text-muted/70 leading-[1.5] m-0 mb-2">
                        cooked, no notes
                      </p>
                    ) : null}

                    {log.changes && (
                      <div
                        className="mb-3 pl-3 py-1"
                        style={{ borderLeft: '2px solid var(--color-basil)' }}
                      >
                        <span
                          className="font-mono font-bold uppercase block mb-0.5"
                          style={{ fontSize: 8, letterSpacing: '0.22em', color: 'var(--color-basil)' }}
                        >
                          changed
                        </span>
                        <span className="font-mono text-[12px] text-text-muted leading-snug">
                          {log.changes}
                        </span>
                      </div>
                    )}

                    {/* Byline */}
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
                        · cooked
                      </span>

                      {isOwn && (
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="ml-auto font-mono text-[10px] uppercase text-text-muted/60 hover:text-oxblood transition-colors bg-transparent border-none cursor-pointer"
                          style={{ letterSpacing: '0.18em' }}
                        >
                          delete
                        </button>
                      )}
                    </div>

                    {/* Reactions */}
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      {REACTION_EMOJIS.map((emoji) => {
                        const logReactions =
                          reactions?.filter(
                            (r) => r.cook_log_id === log.id && r.emoji === emoji,
                          ) || []
                        const count = logReactions.length
                        const hasReacted = logReactions.some(
                          (r) => r.user_id === profile?.id,
                        )

                        return (
                          <button
                            key={emoji}
                            onClick={() => {
                              if (!profile) return
                              toggleReaction.mutate({
                                logId: log.id,
                                userId: profile.id,
                                emoji,
                                recipeId,
                              })
                            }}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 cursor-pointer transition-all border-[1.5px]
                              ${
                                hasReacted
                                  ? ''
                                  : count > 0
                                    ? ''
                                    : 'opacity-0 group-hover:opacity-60 hover:!opacity-100'
                              }`}
                            style={{
                              borderRadius: 999,
                              background: hasReacted ? 'var(--color-tomato-soft)' : 'transparent',
                              borderColor: hasReacted
                                ? 'var(--color-tomato)'
                                : 'var(--color-border)',
                            }}
                          >
                            <span style={{ fontSize: 13 }}>{emoji}</span>
                            {count > 0 && (
                              <span
                                className="font-mono font-bold"
                                style={{
                                  fontSize: 10,
                                  color: hasReacted
                                    ? 'var(--color-tomato)'
                                    : 'var(--color-text-muted)',
                                }}
                              >
                                {count}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Hairline divider — tomato, skipped after the last entry */}
                {!isLast && (
                  <div
                    style={{
                      height: 1,
                      background: 'var(--color-tomato)',
                      opacity: 0.18,
                    }}
                  />
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 space-y-3">
          <RollingPin size={80} className="mx-auto opacity-70" />
          <p className="font-display italic text-base text-text m-0">
            Not cooked yet.
          </p>
          <p className="font-mono text-xs text-text-muted m-0">
            you haven't made this yet — give it a go!
          </p>
        </div>
      )}
    </section>
  )
}

/** Interactive 1–5 star rating. Click a filled star again to clear. */
function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 24,
}: {
  value: number | null
  onChange?: (v: number | null) => void
  readOnly?: boolean
  size?: number
}) {
  return (
    <div className="flex gap-1" role={readOnly ? undefined : 'radiogroup'}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = (value ?? 0) >= n
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(value === n ? null : n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            aria-pressed={filled}
            className={`bg-transparent border-none p-0 ${readOnly ? '' : 'cursor-pointer hover:scale-110'} transition-transform`}
            style={{ lineHeight: 0 }}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill={filled ? 'var(--color-ackee)' : 'none'}
              stroke={filled ? 'var(--color-ackee)' : 'var(--color-text-muted)'}
              strokeWidth="1.5"
              strokeLinejoin="round"
            >
              <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 18.6 5.9 21.3l1.2-6.6L2.3 9.5l6.6-.9z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
