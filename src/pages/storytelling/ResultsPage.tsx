import { Link, Navigate, useParams } from 'react-router-dom'
import { useAppStore } from '../../store/AppStore'
import { useAuth } from '../../store/AuthStore'
import { EmailPasswordForm } from '../../components/EmailPasswordForm'
import { SessionReport } from '../../components/SessionReport'

export function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const { getSession } = useAppStore()
  const { status } = useAuth()
  const session = id ? getSession(id) : undefined

  if (!session) return <Navigate to="/storytelling" replace />

  const unlocked = status === 'signedIn'

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {new Date(session.date + 'T00:00:00').toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <h1 className="text-2xl font-semibold">Your feedback</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{session.topic.text}</p>
      </div>

      {unlocked ? (
        <SessionReport session={session} />
      ) : (
        <div className="relative">
          <div aria-hidden className="pointer-events-none select-none blur-md">
            <SessionReport session={session} />
          </div>
          <div className="absolute inset-0 flex items-start justify-center bg-white/70 pt-4 dark:bg-black/70">
            {status === 'loading' ? (
              <div className="mt-10 h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-500" />
            ) : (
              <div className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                <div>
                  <h2 className="text-lg font-semibold">Your feedback is ready</h2>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Log in (or create an account in seconds) to unlock it — your score, transcript, and suggestions appear right here.
                  </p>
                </div>
                <div className="flex justify-center">
                  <EmailPasswordForm />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-center gap-3 pt-2">
        <Link to="/storytelling" className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700">
          Back to today
        </Link>
        <Link to="/storytelling/history" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white">
          View history
        </Link>
      </div>
    </div>
  )
}
