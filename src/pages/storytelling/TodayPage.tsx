import { Link } from 'react-router-dom'
import { useAppStore } from '../../store/AppStore'

const CATEGORY_LABEL: Record<string, string> = {
  'personal anecdote': 'Personal anecdote',
  hypothetical: 'Hypothetical',
  persuasive: 'Persuasive',
  descriptive: 'Descriptive',
  humorous: 'Humorous',
}

export function TodayPage() {
  const { state, todayTopic, todaySession } = useAppStore()
  const mostRecent = state.sessions[0]
  const showWarmup = mostRecent && mostRecent.date !== new Date().toISOString().slice(0, 10) && !todaySession

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl font-semibold">Today's story</h1>
      </div>

      {showWarmup && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-900/60 dark:bg-brand-900/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Warm-up before today's session
          </p>
          <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{mostRecent.nextExercise.text}</p>
        </div>
      )}

      {todaySession ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">You already recorded today</p>
          <p className="mt-1 text-lg font-medium">Score: {todaySession.overallScore} / 100</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={`/storytelling/results/${todaySession.id}`}
              className="inline-flex items-center rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white"
            >
              View today's feedback
            </Link>
            <Link
              to="/storytelling/record"
              className="inline-flex items-center rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
            >
              Retry today's recording
            </Link>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            Recording again replaces today's transcript, score, and feedback — it doesn't add a second entry.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {CATEGORY_LABEL[todayTopic.category]}
            </span>
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              Difficulty {todayTopic.baseDifficulty}/5
            </span>
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              ~{todayTopic.targetSeconds}s
            </span>
          </div>
          <p className="text-lg font-medium leading-snug">{todayTopic.text}</p>
          {todayTopic.constraint && (
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Constraint: {todayTopic.constraint}</p>
          )}
          <Link
            to="/storytelling/record"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-white" />
            Record
          </Link>
        </div>
      )}

      <p className="text-center text-xs text-neutral-400">
        {state.sessions.length} session{state.sessions.length === 1 ? '' : 's'} logged ·{' '}
        <Link to="/storytelling/history" className="underline underline-offset-2">
          view history
        </Link>
      </p>
    </div>
  )
}
