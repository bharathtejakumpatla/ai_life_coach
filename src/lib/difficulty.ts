import type { Session } from '../types'

const MIN_DIFFICULTY = 1
const MAX_DIFFICULTY = 5
const ROLLING_WINDOW = 5

/** Rolling average of the last 3-5 scores nudges difficulty by at most one level. */
export function nextDifficultyLevel(sessions: Session[], currentLevel: number): number {
  const recent = sessions.slice(0, ROLLING_WINDOW)
  if (recent.length < 3) return currentLevel

  const avg = recent.reduce((sum, s) => sum + s.overallScore, 0) / recent.length
  if (avg > 80) return Math.min(MAX_DIFFICULTY, currentLevel + 1)
  if (avg < 50) return Math.max(MIN_DIFFICULTY, currentLevel - 1)
  return currentLevel
}
