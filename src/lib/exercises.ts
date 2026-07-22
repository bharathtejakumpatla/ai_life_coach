import type { Exercise, SubMetric } from '../types'

export const EXERCISE_LIBRARY: Exercise[] = [
  {
    id: 'ex-structure-1',
    text: 'Tell a 30-second story with a clear beginning, middle, and end — nothing else.',
    targetMetric: 'structure',
    difficulty: 1,
  },
  {
    id: 'ex-structure-2',
    text: 'Practice 3 transition phrases ("after that…", "which led to…", "in the end…") by using each one in a sentence.',
    targetMetric: 'structure',
    difficulty: 2,
  },
  {
    id: 'ex-fluency-1',
    text: 'Record a 30-second story with zero filler words. Restart if you slip.',
    targetMetric: 'fluency',
    difficulty: 2,
  },
  {
    id: 'ex-fluency-2',
    text: 'Read a short paragraph aloud, pausing on purpose instead of saying "um."',
    targetMetric: 'fluency',
    difficulty: 1,
  },
  {
    id: 'ex-vocabulary-1',
    text: 'Describe an everyday object using 5 senses, avoiding any word you have already used in a past session.',
    targetMetric: 'vocabulary',
    difficulty: 2,
  },
  {
    id: 'ex-vocabulary-2',
    text: 'Tell a 20-second story without using the words "good," "bad," "nice," or "thing."',
    targetMetric: 'vocabulary',
    difficulty: 3,
  },
  {
    id: 'ex-pacing-1',
    text: 'Practice a story out loud at a deliberately slower pace — aim for ~110 words per minute.',
    targetMetric: 'pacing',
    difficulty: 1,
  },
  {
    id: 'ex-pacing-2',
    text: 'Record a story and mark where you rushed. Redo just that section slower.',
    targetMetric: 'pacing',
    difficulty: 2,
  },
]

export function pickExerciseFor(metric: SubMetric, difficultyLevel: number): Exercise {
  const candidates = EXERCISE_LIBRARY.filter((e) => e.targetMetric === metric)
  const sorted = [...candidates].sort(
    (a, b) => Math.abs(a.difficulty - difficultyLevel) - Math.abs(b.difficulty - difficultyLevel),
  )
  return sorted[0] ?? EXERCISE_LIBRARY[0]
}
