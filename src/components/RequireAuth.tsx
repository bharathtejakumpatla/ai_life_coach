import { Outlet } from 'react-router-dom'
import { useAuth } from '../store/AuthStore'
import { EmailPasswordForm } from './EmailPasswordForm'

export function RequireAuth() {
  const { status } = useAuth()

  if (status === 'loading') return null

  if (status === 'signedOut') {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <div>
          <h2 className="text-lg font-semibold">Log in to view past session results</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Your story history, scores, and trends are saved to your account — log in, or sign up if you're new.
          </p>
        </div>
        <EmailPasswordForm />
      </div>
    )
  }

  return <Outlet />
}
