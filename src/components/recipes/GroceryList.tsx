import { useState } from 'react'
import { useAuth } from '../../hooks/use-auth'
import {
  useGroceryItems,
  useAddGroceryItem,
  useToggleGroceryItem,
  useDeleteGroceryItem,
  useClearCheckedGrocery,
} from '../../hooks/use-grocery'

export function GroceryList() {
  const { profile } = useAuth()
  const userId = profile?.id
  const { data: items } = useGroceryItems(userId)
  const addItem = useAddGroceryItem()
  const toggle = useToggleGroceryItem()
  const del = useDeleteGroceryItem()
  const clearChecked = useClearCheckedGrocery()

  const [draft, setDraft] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const label = draft.trim()
    if (!label || !userId) return
    addItem.mutate(
      { userId, label },
      { onSuccess: () => setDraft('') },
    )
  }

  const checkedCount = items?.filter((i) => i.checked).length ?? 0
  const total = items?.length ?? 0

  return (
    <aside
      className="bg-bg-card border border-border p-4 sm:p-5"
      style={{ borderRadius: 4 }}
    >
      {/* Heading */}
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <div>
          <div
            className="font-mono font-bold"
            style={{
              fontSize: 9,
              letterSpacing: '0.28em',
              color: 'var(--color-basil)',
              textTransform: 'uppercase',
            }}
          >
            La lista
          </div>
          <h2
            className="m-0 font-display italic font-medium text-text leading-none mt-1"
            style={{ fontSize: 22 }}
          >
            Shopping list
          </h2>
        </div>
        {total > 0 && (
          <span className="font-mono text-[10px] text-text-muted">
            {total - checkedCount} left
          </span>
        )}
      </div>

      {/* Add input */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-3">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="add an item…"
          className="flex-1 px-3 py-2 font-mono text-[13px] bg-bg text-text
            border border-border placeholder:text-text-muted/50 placeholder:italic
            focus:outline-none focus:border-tomato transition-colors"
          style={{ borderRadius: 2 }}
        />
        <button
          type="submit"
          disabled={!draft.trim() || addItem.isPending}
          className="btn-trat disabled:opacity-40 px-3"
          aria-label="Add item"
          style={{ fontSize: 13 }}
        >
          +
        </button>
      </form>

      {addItem.isError && (
        <p className="font-mono text-[11px] text-oxblood m-0 mb-2">
          Couldn’t add that item. Please try again.
        </p>
      )}

      {/* Items */}
      {total === 0 ? (
        <p className="font-mono text-xs text-text-muted/70 italic py-2 m-0">
          Nothing on the list yet — add what you need for this week.
        </p>
      ) : (
        <ul className="list-none p-0 m-0 flex flex-col">
          {items!.map((item) => (
            <li
              key={item.id}
              className="group flex items-center gap-2.5 py-2"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <button
                onClick={() =>
                  toggle.mutate({
                    id: item.id,
                    checked: !item.checked,
                    userId: userId!,
                  })
                }
                aria-label={item.checked ? 'Uncheck' : 'Check off'}
                aria-pressed={item.checked}
                className="shrink-0 inline-flex items-center justify-center cursor-pointer bg-transparent"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  border: item.checked
                    ? '1.5px solid var(--color-basil)'
                    : '1.5px solid var(--color-border)',
                  background: item.checked ? 'var(--color-basil)' : 'transparent',
                  color: 'var(--color-cream)',
                }}
              >
                {item.checked && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>

              <span
                className="flex-1 font-mono text-[13px] leading-snug"
                style={{
                  color: item.checked
                    ? 'var(--color-text-muted)'
                    : 'var(--color-text)',
                  textDecoration: item.checked ? 'line-through' : 'none',
                  opacity: item.checked ? 0.6 : 1,
                }}
              >
                {item.label}
              </span>

              <button
                onClick={() => del.mutate({ id: item.id, userId: userId! })}
                aria-label="Remove item"
                className="shrink-0 font-mono text-text-muted/50 hover:text-oxblood cursor-pointer bg-transparent border-none text-base leading-none"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Clear checked */}
      {checkedCount > 0 && (
        <button
          onClick={() => clearChecked.mutate({ userId: userId! })}
          className="mt-3 font-mono text-[10px] uppercase font-bold text-text-muted hover:text-oxblood cursor-pointer bg-transparent border-none"
          style={{ letterSpacing: '0.16em' }}
        >
          Clear checked ({checkedCount})
        </button>
      )}
    </aside>
  )
}
