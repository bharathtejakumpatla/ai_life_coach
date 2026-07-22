import type { Session } from '../types'
import { findRecurringIssue } from '../lib/insights'
import { SUB_METRIC_COLORS } from '../lib/metricColors'

export function RecurringIssueCallout({ sessionsDesc }: { sessionsDesc: Session[] }) {
  const issue = findRecurringIssue(sessionsDesc)
  if (!issue) return null
  const color = SUB_METRIC_COLORS[issue.metric]

  return (
    <div
      className="flex items-start gap-3 rounded-xl border px-4 py-3"
      style={{ borderColor: `${color.light}55`, backgroundColor: `${color.light}14` }}
    >
      <span aria-hidden className="mt-0.5 text-lg">
        ⚠️
      </span>
      <div className="text-sm">
        <p className="font-medium text-neutral-900 dark:text-neutral-100">
          {issue.label} has been your lowest score for {issue.streak} sessions in a row
        </p>
        <p className="mt-0.5 text-neutral-600 dark:text-neutral-400">
          This looks like a persistent weak spot, not just an off day — worth a focused warm-up.
        </p>
      </div>
    </div>
  )
}
