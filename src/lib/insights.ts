import type { Session, SubMetric } from '../types'

const SUB_METRIC_LABEL: Record<SubMetric, string> = {
  structure: 'Structure',
  fluency: 'Fluency',
  vocabulary: 'Vocabulary',
  pacing: 'Pacing',
}

function weakestMetric(session: Session): SubMetric {
  return (Object.entries(session.subScores) as [SubMetric, number][]).sort((a, b) => a[1] - b[1])[0][0]
}

/** Flags when the same sub-metric has been the lowest score 3+ sessions in a row (most recent first). */
export function findRecurringIssue(sessionsDesc: Session[]): { metric: SubMetric; label: string; streak: number } | null {
  if (sessionsDesc.length < 3) return null
  const first = weakestMetric(sessionsDesc[0])
  let streak = 1
  for (let i = 1; i < sessionsDesc.length; i++) {
    if (weakestMetric(sessionsDesc[i]) === first) streak++
    else break
  }
  if (streak >= 3) {
    return { metric: first, label: SUB_METRIC_LABEL[first], streak }
  }
  return null
}
