import { useMemo, useState } from 'react'
import type { Session, SubMetric } from '../types'

type SeriesKey = 'overall' | SubMetric

const SERIES: { key: SeriesKey; label: string; var: string }[] = [
  { key: 'overall', label: 'Overall', var: '--series-overall' },
  { key: 'structure', label: 'Structure', var: '--series-structure' },
  { key: 'fluency', label: 'Fluency', var: '--series-fluency' },
  { key: 'vocabulary', label: 'Vocabulary', var: '--series-vocabulary' },
  { key: 'pacing', label: 'Pacing', var: '--series-pacing' },
]

function valueFor(session: Session, key: SeriesKey): number {
  return key === 'overall' ? session.overallScore : session.subScores[key]
}

const WIDTH = 640
const HEIGHT = 240
const PAD = { top: 16, right: 16, bottom: 28, left: 32 }

export function TrendChart({ sessionsAsc }: { sessionsAsc: Session[] }) {
  const [visible, setVisible] = useState<Set<SeriesKey>>(new Set(SERIES.map((s) => s.key)))
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const [tableView, setTableView] = useState(false)

  const plotW = WIDTH - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const n = sessionsAsc.length

  const x = (i: number) => PAD.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW)
  const y = (v: number) => PAD.top + plotH - (v / 100) * plotH

  const paths = useMemo(() => {
    return SERIES.map((s) => ({
      ...s,
      d: sessionsAsc.map((sess, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(valueFor(sess, s.key))}`).join(' '),
    }))
  }, [sessionsAsc])

  const toggle = (key: SeriesKey) => {
    setVisible((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  if (n === 0) return null

  const dateLabel = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {SERIES.map((s) => {
            const on = visible.has(s.key)
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => toggle(s.key)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-opacity ${
                  on
                    ? 'border-neutral-300 dark:border-neutral-700'
                    : 'border-neutral-200 opacity-40 dark:border-neutral-800'
                }`}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: `var(${s.var})` }}
                  aria-hidden
                />
                {s.label}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => setTableView((v) => !v)}
          className="rounded-full border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
        >
          {tableView ? 'Show chart' : 'Show table'}
        </button>
      </div>

      {tableView ? (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
              <tr>
                <th className="px-3 py-2 font-medium">Date</th>
                {SERIES.map((s) => (
                  <th key={s.key} className="px-3 py-2 font-medium">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessionsAsc.map((sess) => (
                <tr key={sess.id} className="border-t border-neutral-200 dark:border-neutral-800">
                  <td className="px-3 py-2 tabular-nums">{dateLabel(sess.date)}</td>
                  {SERIES.map((s) => (
                    <td key={s.key} className="px-3 py-2 tabular-nums">
                      {valueFor(sess, s.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full touch-none"
            onMouseLeave={() => setHoverIdx(null)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const relX = ((e.clientX - rect.left) / rect.width) * WIDTH
              const idx = Math.round(((relX - PAD.left) / plotW) * (n - 1))
              setHoverIdx(Math.min(n - 1, Math.max(0, idx)))
            }}
          >
            {[0, 25, 50, 75, 100].map((v) => (
              <g key={v}>
                <line
                  x1={PAD.left}
                  x2={WIDTH - PAD.right}
                  y1={y(v)}
                  y2={y(v)}
                  stroke="var(--chart-grid)"
                  strokeWidth={1}
                />
                <text x={PAD.left - 8} y={y(v)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--chart-muted)">
                  {v}
                </text>
              </g>
            ))}

            {n > 1 &&
              sessionsAsc.map((sess, i) => {
                if (i % Math.ceil(n / 6) !== 0 && i !== n - 1) return null
                return (
                  <text key={sess.id} x={x(i)} y={HEIGHT - 8} textAnchor="middle" fontSize={10} fill="var(--chart-muted)">
                    {dateLabel(sess.date)}
                  </text>
                )
              })}

            {paths
              .filter((p) => visible.has(p.key))
              .map((p) => (
                <path key={p.key} d={p.d} fill="none" stroke={`var(${p.var})`} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              ))}

            {hoverIdx !== null && (
              <line
                x1={x(hoverIdx)}
                x2={x(hoverIdx)}
                y1={PAD.top}
                y2={HEIGHT - PAD.bottom}
                stroke="var(--chart-axis)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            )}

            {hoverIdx !== null &&
              paths
                .filter((p) => visible.has(p.key))
                .map((p) => (
                  <circle
                    key={p.key}
                    cx={x(hoverIdx)}
                    cy={y(valueFor(sessionsAsc[hoverIdx], p.key))}
                    r={4}
                    fill={`var(${p.var})`}
                    stroke="var(--chart-surface)"
                    strokeWidth={2}
                  />
                ))}
          </svg>

          {hoverIdx !== null && (
            <div
              className="pointer-events-none absolute top-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
              style={{
                left: `${(x(hoverIdx) / WIDTH) * 100}%`,
                transform: hoverIdx > n / 2 ? 'translateX(-105%)' : 'translateX(8px)',
              }}
            >
              <p className="mb-1 font-medium text-neutral-700 dark:text-neutral-200">
                {dateLabel(sessionsAsc[hoverIdx].date)}
              </p>
              {SERIES.filter((s) => visible.has(s.key)).map((s) => (
                <p key={s.key} className="flex items-center justify-between gap-3 text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `var(${s.var})` }} />
                    {s.label}
                  </span>
                  <span className="tabular-nums text-neutral-800 dark:text-neutral-100">
                    {valueFor(sessionsAsc[hoverIdx], s.key)}
                  </span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
