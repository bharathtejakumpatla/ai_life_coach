import { Link, Navigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/AppStore'
import { SessionReport } from '../components/SessionReport'

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { getSession } = useAppStore()
  const session = id ? getSession(id) : undefined

  if (!session) return <Navigate to="/history" replace />

  return (
    <div className="space-y-6">
      <div>
        <Link to="/history" className="text-sm text-brand-600 dark:text-brand-400">
          ← All sessions
        </Link>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {new Date(session.date + 'T00:00:00').toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}{' '}
          · Difficulty {session.difficultyLevel}/5
        </p>
        <h1 className="text-2xl font-semibold">{session.topic.text}</h1>
        {session.topic.constraint && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Constraint: {session.topic.constraint}</p>
        )}
      </div>

      <SessionReport session={session} />
    </div>
  )
}
