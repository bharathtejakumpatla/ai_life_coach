import { NavLink, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="min-h-svh bg-[#f9f9f7] text-neutral-900 dark:bg-[#0d0d0d] dark:text-neutral-50">
      <header className="sticky top-0 z-10 border-b border-neutral-200/80 bg-[#f9f9f7]/90 backdrop-blur dark:border-neutral-800/80 dark:bg-[#0d0d0d]/90">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2 text-base font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-sm text-white">
              AI
            </span>
            AI Life Coach
          </NavLink>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
