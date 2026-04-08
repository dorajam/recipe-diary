import { useState } from 'react'
import { useAuth } from '../../hooks/use-auth'
import { useCookLog, useAddCookLog, useDeleteCookLog } from '../../hooks/use-cook-log'

interface CookLogSectionProps {
  recipeId: string
}

export function CookLogSection({ recipeId }: CookLogSectionProps) {
  const { profile } = useAuth()
  const { data: logs } = useCookLog(recipeId)
  const addLog = useAddCookLog()
  const deleteLog = useDeleteCookLog()

  const [showForm, setShowForm] = useState(false)
  const [cookedOn, setCookedOn] = useState(() => new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')

  async function handleQuickLog() {
    if (!profile) return

    await addLog.mutateAsync({
      recipeId,
      cookedBy: profile.id,
      cookedOn: new Date().toISOString().split('T')[0],
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    await addLog.mutateAsync({
      recipeId,
      cookedBy: profile.id,
      cookedOn,
      note: note.trim() || undefined,
    })

    setNote('')
    setShowForm(false)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl m-0">Cook Log</h2>
        <div className="flex gap-2">
          <button
            onClick={handleQuickLog}
            disabled={addLog.isPending}
            className="px-3.5 py-1.5 rounded-full text-sm bg-accent text-white
              hover:opacity-90 transition-opacity cursor-pointer border-none font-medium"
          >
            I made this!
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3.5 py-1.5 rounded-full text-sm text-text-muted border border-border
              hover:border-accent/40 transition-colors cursor-pointer bg-transparent"
          >
            + with notes
          </button>
        </div>
      </div>

      {/* Expanded form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-xl border border-border bg-bg-card space-y-3"
        >
          <div className="flex gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-text-muted">
                Date
              </label>
              <input
                type="date"
                value={cookedOn}
                onChange={(e) => setCookedOn(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-bg text-sm
                  focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-muted">
              Notes
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="How did it turn out? Any changes you made?"
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm
                focus:outline-none focus:border-accent resize-y
                placeholder:text-text-muted/50"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={addLog.isPending}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium
                hover:opacity-90 cursor-pointer border-none"
            >
              Log it
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm text-text-muted
                hover:text-text cursor-pointer bg-transparent border-none"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Timeline */}
      {logs?.length ? (
        <div className="space-y-3">
          {logs.map((log) => {
            const author = log.profiles
            const isOwn = profile?.id === log.cooked_by

            return (
              <div
                key={log.id}
                className="flex gap-3 items-start group"
              >
                <div
                  className="w-2 h-2 rounded-full mt-2 shrink-0"
                  style={{ backgroundColor: author.accent_colour }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: author.accent_colour }}
                    >
                      {author.display_name}
                    </span>
                    <span className="text-xs text-text-muted">
                      made this on{' '}
                      {new Date(log.cooked_on + 'T00:00:00').toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    {isOwn && (
                      <button
                        onClick={() =>
                          deleteLog.mutate({ logId: log.id, recipeId })
                        }
                        className="text-xs text-text-muted/30 hover:text-accent
                          transition-colors opacity-0 group-hover:opacity-100
                          bg-transparent border-none cursor-pointer"
                      >
                        delete
                      </button>
                    )}
                  </div>
                  {log.note && (
                    <p className="text-sm text-text-muted leading-relaxed m-0 mt-1">
                      {log.note}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-text-muted">
          No one's made this yet. Be the first!
        </p>
      )}
    </section>
  )
}
