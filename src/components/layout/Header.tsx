import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/use-auth'
import { useRecipes } from '../../hooks/use-recipes'

function initialsFor(displayName: string): string {
  const parts = displayName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

interface AvatarProps {
  initials: string
  size?: number
  onClick?: () => void
  title?: string
}

function Avatar({ initials, size = 34, onClick, title }: AvatarProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--color-tomato)',
        color: 'var(--color-cream)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.04em',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        flexShrink: 0,
        cursor: 'pointer',
        padding: 0,
      }}
    >
      {initials}
    </button>
  )
}

function GhostAddBtn({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dims = size === 'sm' ? { h: 32, px: 10, fs: 12 } : { h: 40, px: 14, fs: 13 }
  return (
    <Link
      to="/recipes/new"
      style={{
        height: dims.h,
        padding: `0 ${dims.px}px`,
        borderRadius: 4,
        background: 'transparent',
        color: 'var(--color-tomato)',
        border: '1.5px solid var(--color-tomato)',
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: dims.fs,
        fontWeight: 500,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        textDecoration: 'none',
        lineHeight: 1,
      }}
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontStyle: 'normal', fontWeight: 500 }}>+</span>
      aggiungi
    </Link>
  )
}

function IconAddBtn() {
  return (
    <Link
      to="/recipes/new"
      aria-label="aggiungi"
      style={{
        width: 32,
        height: 32,
        borderRadius: 4,
        background: 'var(--color-tomato)',
        color: 'var(--color-cream)',
        border: '1px solid var(--color-text)',
        boxShadow: '2px 2px 0 var(--color-text)',
        fontSize: 18,
        lineHeight: 1,
        fontWeight: 600,
        cursor: 'pointer',
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
      }}
    >
      +
    </Link>
  )
}

function MainWordmark() {
  return (
    <h1
      className="leading-[1.05] tracking-[-0.01em] sm:tracking-[-0.015em]"
      style={{
        margin: 0,
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontWeight: 500,
        color: 'var(--color-text)',
        fontSize: 'clamp(24px, 4.2vw, 52px)',
      }}
    >
      La <span style={{ color: 'var(--color-tomato)' }}>Cucina</span> di{' '}
      <span style={{ color: 'var(--color-basil)' }}>Feeny</span> &amp;{' '}
      <span style={{ color: 'var(--color-basil)' }}>Beeny</span>
    </h1>
  )
}

function InlineWordmark() {
  return (
    <span
      style={{
        display: 'inline-block',
        margin: 0,
        fontFamily: 'var(--font-display)',
        fontSize: 22,
        lineHeight: 1,
        fontStyle: 'italic',
        fontWeight: 500,
        letterSpacing: '-0.01em',
        color: 'var(--color-text)',
      }}
    >
      La <span style={{ color: 'var(--color-tomato)' }}>Cucina</span> di{' '}
      <span style={{ color: 'var(--color-basil)' }}>Feeny</span>{' '}
      <span style={{ color: 'var(--color-tomato)' }}>&amp;</span>{' '}
      <span style={{ color: 'var(--color-basil)' }}>Beeny</span>
    </span>
  )
}

export function Header() {
  const { profile, signOut } = useAuth()
  const { data: recipes } = useRecipes()
  const recipeCount = recipes?.length ?? 0
  const initials = profile ? initialsFor(profile.display_name) : ''

  const sentinelRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: '0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <header style={{ background: 'var(--color-bg)' }}>
        {/* Tier 1 — trivia strip */}
        <div
          className="px-[22px] sm:px-14"
          style={{
            paddingTop: 8,
            paddingBottom: 8,
            borderBottom: '1px solid var(--color-border)',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            letterSpacing: '0.3em',
          }}
        >
          <span className="sm:hidden">EST. 2011 · VOL. ONE</span>
          <span
            className="hidden sm:inline"
            style={{ letterSpacing: '0.36em' }}
          >
            EST. 2011 · HOME COOKING · VOL. ONE
          </span>
          <span style={{ color: 'var(--color-tomato)' }}>
            ● {recipeCount}{' '}
            <span
              className="hidden sm:inline"
              style={{ color: 'var(--color-text-muted)' }}
            >
              RICETTE
            </span>
          </span>
        </div>

        {/* Tier 2 — wordmark + actions */}
        <div
          className="px-[22px] sm:px-14 pt-4 pb-2 sm:pt-6 sm:pb-4"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Link
            to="/"
            className="flex-1"
            style={{ textDecoration: 'none', minWidth: 0 }}
          >
            <MainWordmark />
          </Link>

          {profile && (
            <>
              {/* Desktop actions */}
              <div
                className="hidden sm:flex"
                style={{ gap: 14, alignItems: 'center' }}
              >
                <GhostAddBtn />
                <Avatar
                  initials={initials}
                  size={34}
                  onClick={signOut}
                  title="Sign out"
                />
              </div>
              {/* Mobile actions */}
              <div
                className="flex sm:hidden"
                style={{ gap: 8, alignItems: 'center', flexShrink: 0 }}
              >
                <IconAddBtn />
                <Avatar
                  initials={initials}
                  size={32}
                  onClick={signOut}
                  title="Sign out"
                />
              </div>
            </>
          )}
        </div>

        {/* Sentinel for sticky-bar IntersectionObserver */}
        <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
      </header>

      {/* Sticky condensed bar (desktop only) */}
      <div
        aria-hidden={!scrolled}
        className="hidden sm:flex px-14"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          paddingTop: 12,
          paddingBottom: 12,
          background: 'var(--color-bg-card)',
          borderBottom: '1px solid var(--color-border)',
          justifyContent: 'space-between',
          alignItems: 'center',
          transform: scrolled ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.2s ease',
          pointerEvents: scrolled ? 'auto' : 'none',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <InlineWordmark />
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--color-text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}
          >
            ↑ TOP
          </button>
          <GhostAddBtn size="sm" />
          {profile && (
            <Avatar
              initials={initials}
              size={28}
              onClick={signOut}
              title="Sign out"
            />
          )}
        </div>
      </div>
    </>
  )
}
