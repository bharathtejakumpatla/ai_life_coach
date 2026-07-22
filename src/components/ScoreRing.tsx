import { STATUS_COLOR, scoreTier } from '../lib/metricColors'

const TIER_LABEL: Record<ReturnType<typeof scoreTier>, string> = {
  good: 'Strong',
  warning: 'Solid',
  critical: 'Needs work',
}

export function ScoreRing({ score, size = 128 }: { score: number; size?: number }) {
  const tier = scoreTier(score)
  const color = STATUS_COLOR[tier]
  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-neutral-200 dark:text-neutral-800"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.light}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tabular-nums">{score}</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">/ 100</span>
        </div>
      </div>
      <span
        className="rounded-full px-2 py-0.5 text-xs font-medium"
        style={{ color: color.light, backgroundColor: `${color.light}1a` }}
      >
        {TIER_LABEL[tier]}
      </span>
    </div>
  )
}
