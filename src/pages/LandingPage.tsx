import { Link } from 'react-router-dom'
import { useAppStore } from '../store/AppStore'

interface Segment {
  id: string
  title: string
  description: string
  active: boolean
}

function monogram(title: string): string {
  return title
    .split(/\s+/)
    .filter((word) => word !== '&')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

const GROWTH_SEGMENTS: Segment[] = [
  {
    id: 'storytelling',
    title: 'Storytelling & Communication',
    description:
      'Practice one real-life story every day and get AI feedback on clarity, structure, and confidence.',
    active: true,
  },
  {
    id: 'nutrition',
    title: 'Nutrition & Calories',
    description:
      'Log what you eat naturally and get instant calorie, protein, carb, and fat insights.',
    active: false,
  },
  {
    id: 'fitness',
    title: 'Fitness & Health',
    description:
      'Track workouts, sleep, weight, and build healthier habits with daily check-ins.',
    active: false,
  },
  {
    id: 'career',
    title: 'Career Growth',
    description:
      'Strengthen interview stories, leadership, and professional communication through guided practice.',
    active: false,
  },
  {
    id: 'personal-growth',
    title: 'Personal Growth',
    description:
      'Reflect daily, build discipline, and improve the habits that shape your future.',
    active: false,
  },
]

export function LandingPage() {
  const { state } = useAppStore()
  const storytellingStats =
    state.sessions.length > 0 ? `Level ${state.difficultyLevel}/5 · ${state.sessions.length} session${state.sessions.length === 1 ? '' : 's'} logged` : 'Not started yet'

  return (
    <div className="space-y-10">
      <div className="space-y-3 pt-4 text-center sm:pt-8">
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Build the life you want, one meaningful improvement at a time.
        </h1>
        <p className="mx-auto max-w-xl text-sm text-neutral-500 dark:text-neutral-400 sm:text-base">
          Pick a track below. Each one runs a short daily rep, gives you real AI feedback, and tracks your progress
          over time — no fluff.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {GROWTH_SEGMENTS.map((segment) =>
          segment.active ? (
            <Link
              key={segment.id}
              to="/storytelling"
              className="group flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand-700"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-xs font-semibold text-white">
                  {monogram(segment.title)}
                </span>
                <span className="rounded-full bg-good-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-good">
                  Active
                </span>
              </div>
              <div>
                <h2 className="text-base font-semibold">{segment.title}</h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{segment.description}</p>
              </div>
              <div className="mt-auto flex items-center justify-between pt-1 text-sm">
                <span className="text-xs text-neutral-400">{storytellingStats}</span>
                <span className="flex items-center gap-1 font-medium text-brand-600 transition-transform group-hover:translate-x-0.5 dark:text-brand-400">
                  Start today's session →
                </span>
              </div>
            </Link>
          ) : (
            <div
              key={segment.id}
              className="flex flex-col gap-3 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 p-5 opacity-70 dark:border-neutral-800 dark:bg-neutral-900/40"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-200 text-xs font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  {monogram(segment.title)}
                </span>
                <span className="rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:border-neutral-700">
                  Coming soon
                </span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-neutral-600 dark:text-neutral-300">{segment.title}</h2>
                <p className="mt-1 text-sm text-neutral-400 dark:text-neutral-500">{segment.description}</p>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
