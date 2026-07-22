import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAppStore } from '../store/AppStore'

export function StorytellingLayout() {
  const { state } = useAppStore()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-500 text-white'
        : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
    }`

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200">
            All segments
          </Link>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">Storytelling</span>
        </div>
        <nav className="flex items-center gap-1">
          <NavLink to="/storytelling" end className={linkClass}>
            Today
          </NavLink>
          <NavLink to="/storytelling/history" className={linkClass}>
            History
          </NavLink>
          <span className="ml-2 hidden rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-500 sm:inline dark:border-neutral-700 dark:text-neutral-400">
            Level {state.difficultyLevel}/5
          </span>
        </nav>
      </div>
      <Outlet />
    </div>
  )
}
