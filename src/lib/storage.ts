import type { AppState } from '../types'
import { buildSeedState } from './seed'

const STORAGE_KEY = 'storytelling-evaluator/state/v1'
const AUDIO_RETENTION_DAYS = 7

function pruneOldAudio(state: AppState): AppState {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - AUDIO_RETENTION_DAYS)
  const cutoffISO = cutoff.toISOString().slice(0, 10)
  return {
    ...state,
    sessions: state.sessions.map((s) => (s.audioRef && s.date < cutoffISO ? { ...s, audioRef: undefined } : s)),
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seeded = buildSeedState()
      saveState(seeded)
      return seeded
    }
    return JSON.parse(raw) as AppState
  } catch {
    return buildSeedState()
  }
}

export function saveState(state: AppState): void {
  const pruned = pruneOldAudio(state)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned))
  } catch {
    // Likely quota exceeded from stored audio — drop all but the most recent recording and retry.
    const strippedAll = {
      ...pruned,
      sessions: pruned.sessions.map((s, i) => (i === 0 ? s : { ...s, audioRef: undefined })),
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(strippedAll))
    } catch {
      const noAudio = { ...pruned, sessions: pruned.sessions.map((s) => ({ ...s, audioRef: undefined })) }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(noAudio))
    }
  }
}
