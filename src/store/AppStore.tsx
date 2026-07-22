import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AppState, Session } from '../types'
import { loadState, saveState } from '../lib/storage'
import { getTopicForDate } from '../lib/topics'
import { nextDifficultyLevel } from '../lib/difficulty'

const todayISO = () => new Date().toISOString().slice(0, 10)

interface AppStoreValue {
  state: AppState
  todayTopic: ReturnType<typeof getTopicForDate>
  todaySession: Session | undefined
  addSession: (session: Session) => void
  getSession: (id: string) => Session | undefined
}

const AppStoreContext = createContext<AppStoreValue | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState())

  const todayTopic = useMemo(
    () => getTopicForDate(todayISO(), state.difficultyLevel),
    [state.difficultyLevel],
  )

  const todaySession = state.sessions.find((s) => s.date === todayISO())

  const addSession = (session: Session) => {
    setState((prev) => {
      // One session per day: a same-day retry replaces the earlier attempt instead of stacking.
      const withoutSameDay = prev.sessions.filter((s) => s.date !== session.date)
      const sessions = [session, ...withoutSameDay]
      const difficultyLevel = nextDifficultyLevel(sessions, prev.difficultyLevel)
      const next: AppState = { ...prev, sessions, difficultyLevel }
      saveState(next)
      return next
    })
  }

  const getSession = (id: string) => state.sessions.find((s) => s.id === id)

  return (
    <AppStoreContext.Provider value={{ state, todayTopic, todaySession, addSession, getSession }}>
      {children}
    </AppStoreContext.Provider>
  )
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider')
  return ctx
}
