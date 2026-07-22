import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { EmailPasswordForm } from './EmailPasswordForm'
import { useAuth } from '../store/AuthStore'

export function Layout() {
  const { status, user, signOut } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

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

          {status === 'signedIn' ? (
            <button
              type="button"
              onClick={() => signOut()}
              title={user?.email ?? undefined}
              className="flex items-center gap-2 rounded-full border border-neutral-200 py-1 pl-1 pr-3 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-semibold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-200">
                {(user?.email ?? '?')[0]?.toUpperCase()}
              </span>
              Log out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              title="Log in"
              aria-label="Log in"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} stroke="currentColor" className="h-4 w-4">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 12h4.5m0 0-3-3m3 3-3 3m-8.25-3H12"
                />
              </svg>
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
        <Outlet />
      </main>

      {loginOpen && (
        <div
          className="fixed inset-0 z-20 flex items-start justify-center bg-black/40 px-4 pt-20"
          onClick={() => setLoginOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold">Log in or sign up</h2>
              <button
                type="button"
                onClick={() => setLoginOpen(false)}
                aria-label="Close"
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                ×
              </button>
            </div>
            <EmailPasswordForm onSuccess={() => setLoginOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
