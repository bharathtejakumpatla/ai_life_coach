import { Link, Navigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/AppStore'
import { SessionReport } from '../components/SessionReport'

export function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const { getSession } = useAppStore()
  const session = id ? getSession(id) : undefined

  if (!session) return <Navigate to="/" replace />

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

      <SessionReport session={session} />

      <div className="flex justify-center gap-3 pt-2">
        <Link to="/" className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700">
          Back to today
        </Link>
        <Link to="/history" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white">
          View history
        </Link>
      </div>
    </div>
  )
}
