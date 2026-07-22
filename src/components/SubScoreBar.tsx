import type { SubMetric } from '../types'
import { SUB_METRIC_COLORS } from '../lib/metricColors'

export function SubScoreBar({ metric, score }: { metric: SubMetric; score: number }) {
  const color = SUB_METRIC_COLORS[metric]
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: color.light }}
            aria-hidden
          />
          {color.label}
        </span>
        <span className="tabular-nums text-neutral-500 dark:text-neutral-400">{score}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(4, score)}%`, backgroundColor: color.light }}
        />
      </div>
    </div>
  )
}
