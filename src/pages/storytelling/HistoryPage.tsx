import { Link } from 'react-router-dom'
import { useAppStore } from '../../store/AppStore'
import { RecurringIssueCallout } from '../../components/RecurringIssueCallout'
import { TrendChart } from '../../components/TrendChart'
import { scoreTier } from '../../lib/metricColors'

const TIER_CLASS: Record<ReturnType<typeof scoreTier>, string> = {
  good: 'bg-good-soft text-good',
  warning: 'bg-warn-soft text-warn',
  critical: 'bg-bad-soft text-bad',
}

export function HistoryPage() {
  const { state } = useAppStore()
  const sessionsDesc = state.sessions
  const sessionsAsc = [...state.sessions].reverse()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {sessionsDesc.length} session{sessionsDesc.length === 1 ? '' : 's'} logged
        </p>
      </div>

      <RecurringIssueCallout sessionsDesc={sessionsDesc} />

      {sessionsAsc.length >= 2 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Score trend</h2>
          <TrendChart sessionsAsc={sessionsAsc} />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
        {sessionsDesc.length === 0 && (
          <p className="p-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
            No sessions yet — record today's story to get started.
          </p>
        )}
        {sessionsDesc.map((session) => (
          <Link
            key={session.id}
            to={`/storytelling/history/${session.id}`}
            className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 last:border-b-0 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {new Date(session.date + 'T00:00:00').toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{session.topic.text}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                Lvl {session.difficultyLevel}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${TIER_CLASS[scoreTier(session.overallScore)]}`}>
                {session.overallScore}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
