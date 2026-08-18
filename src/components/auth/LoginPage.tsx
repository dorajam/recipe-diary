import { useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/use-auth'
import { Tomato } from '../illustrations/Produce'

export function LoginPage() {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  )
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    setErrorMsg('')
    try {
      await signInWithEmail(email.trim())
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-3">
          <div
            className="font-mono font-bold"
            style={{
              fontSize: 10,
              letterSpacing: '0.32em',
              color: 'var(--color-tomato)',
            }}
          >
            HOME COOKING · UN RICETTARIO
          </div>

          <h1
            className="m-0 font-display italic font-medium leading-[0.95] tracking-tight text-text"
            style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)' }}
          >
            Dora&rsquo;s{' '}
            <span style={{ color: 'var(--color-tomato)' }}>Recipe Diary</span>
          </h1>

          <p className="font-display italic text-text-muted text-lg m-0 mt-4">
            A place for the things I cook, discover, and want to make.
          </p>
        </div>

        <div className="flex justify-center">
          <Tomato size={56} />
        </div>

        {status === 'sent' ? (
          <p className="font-display italic text-text text-lg m-0">
            Check your email — we sent a magic link to{' '}
            <span style={{ color: 'var(--color-basil)' }}>{email}</span>.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-3 mx-auto max-w-xs w-full"
          >
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full text-center font-display italic text-lg px-4 py-2 rounded-md border border-text-muted/30 bg-transparent text-text focus:outline-none focus:border-tomato"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="btn-trat btn-trat-ghost inline-flex items-center gap-3 mx-auto disabled:opacity-50"
            >
              <span className="font-display italic">
                {status === 'sending' ? 'inviando…' : 'accedi con email'}
              </span>
            </button>
            {status === 'error' && (
              <p
                className="font-mono text-sm m-0"
                style={{ color: 'var(--color-tomato)' }}
              >
                {errorMsg}
              </p>
            )}
          </form>
        )}

        <p
          className="font-mono font-bold text-text-muted m-0"
          style={{ fontSize: 10, letterSpacing: '0.22em' }}
        >
          A PRIVATE RECIPE JOURNAL
        </p>
      </div>
    </div>
  )
}
