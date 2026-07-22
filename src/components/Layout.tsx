import { NavLink, Outlet } from 'react-router-dom'
import { useAppStore } from '../store/AppStore'

export function Layout() {
  const { state } = useAppStore()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-500 text-white'
        : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
    }`

  return (
    <div className="min-h-svh bg-[#f9f9f7] text-neutral-900 dark:bg-[#0d0d0d] dark:text-neutral-50">
      <header className="sticky top-0 z-10 border-b border-neutral-200/80 bg-[#f9f9f7]/90 backdrop-blur dark:border-neutral-800/80 dark:bg-[#0d0d0d]/90">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2 text-base font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-sm text-white">
              S
            </span>
            Storyteller
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>
              Today
            </NavLink>
            <NavLink to="/history" className={linkClass}>
              History
            </NavLink>
            <span className="ml-2 hidden rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-500 sm:inline dark:border-neutral-700 dark:text-neutral-400">
              Level {state.difficultyLevel}/5
            </span>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
