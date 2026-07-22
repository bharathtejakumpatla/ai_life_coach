import type { AppState, Session } from '../types'
import { generateSession } from './evaluation'
import { getTopicForDate } from './topics'

function isoDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

/** Seeds ~9 days of demo history so History/Trends/adaptive-difficulty are visible on first run. */
export function buildSeedState(): AppState {
  const qualityRolls = [0.28, 0.34, 0.4, 0.46, 0.5, 0.58, 0.62, 0.66, 0.7]
  let difficultyLevel = 1
  const sessions: Session[] = []

  for (let i = qualityRolls.length; i >= 1; i--) {
    const date = isoDaysAgo(i)
    const topic = getTopicForDate(date, difficultyLevel)
    const qualityRoll = qualityRolls[qualityRolls.length - i]
    const session = generateSession(`seed-${date}`, {
      topic,
      difficultyLevel,
      durationSeconds: 80 + Math.round(qualityRoll * 25),
      date,
      qualityRoll,
      // Keep pacing the persistent weak spot for the most recent stretch so the
      // recurring-issue callout has something real to surface.
      paceBias: i <= 4 ? -45 : -10,
    })
    sessions.push(session)

    const recentDesc = [session, ...sessions.slice(0, -1).reverse()]
    difficultyLevel = rollingAdjust(recentDesc, difficultyLevel)
  }

  sessions.reverse() // newest first
  return { difficultyLevel, sessions }
}

function rollingAdjust(sessionsDesc: { overallScore: number }[], currentLevel: number): number {
  const recent = sessionsDesc.slice(0, 5)
  if (recent.length < 3) return currentLevel
  const avg = recent.reduce((sum, s) => sum + s.overallScore, 0) / recent.length
  if (avg > 80) return Math.min(5, currentLevel + 1)
  if (avg < 50) return Math.max(1, currentLevel - 1)
  return currentLevel
}
