import { useState, type FormEvent } from 'react'
import { useAuth } from '../store/AuthStore'
import { useToast } from '../store/ToastStore'

interface EmailPasswordFormProps {
  onSuccess?: () => void
}

export function EmailPasswordForm({ onSuccess }: EmailPasswordFormProps) {
  const { signIn, signUp, configured } = useAuth()
  const { showToast } = useToast()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (!configured) {
    return <p className="text-xs text-neutral-400">Login isn't set up yet.</p>
  }

  const switchMode = (next: 'login' | 'signup') => {
    if (next === mode) return
    setMode(next)
    setError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    const { error } = mode === 'login' ? await signIn(email.trim(), password) : await signUp(email.trim(), password)
    setPending(false)
    if (error) {
      setError(error)
      return
    }
    showToast(mode === 'login' ? 'Welcome back — you\'re logged in.' : "Account created — you're logged in.")
    onSuccess?.()
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="flex rounded-full bg-neutral-100 p-1 text-sm font-medium dark:bg-neutral-800">
        <button
          type="button"
          onClick={() => switchMode('login')}
          aria-pressed={mode === 'login'}
          className={`flex-1 rounded-full px-3 py-1.5 transition-colors ${
            mode === 'login'
              ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
          aria-pressed={mode === 'signup'}
          className={`flex-1 rounded-full px-3 py-1.5 transition-colors ${
            mode === 'signup'
              ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-full border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-brand-400 dark:border-neutral-700 dark:bg-neutral-800"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'signup' ? 'Create a password (6+ characters)' : 'Password'}
          className="w-full rounded-full border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-brand-400 dark:border-neutral-700 dark:bg-neutral-800"
        />
        {error && <p className="text-center text-xs text-bad">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-transform active:scale-95 disabled:opacity-60"
        >
          {pending ? (mode === 'login' ? 'Logging in…' : 'Creating account…') : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
