import type { Topic } from '../types'

// Seed bank (trimmed from the ~100-prompt PRD spec to a representative set for MVP).
export const TOPIC_BANK: Topic[] = [
  {
    id: 't-anecdote-1',
    text: 'Tell a story about a time you got lost somewhere unfamiliar.',
    category: 'personal anecdote',
    baseDifficulty: 1,
    targetSeconds: 75,
  },
  {
    id: 't-anecdote-2',
    text: 'Describe a moment when a stranger helped you unexpectedly.',
    category: 'personal anecdote',
    baseDifficulty: 2,
    constraint: 'Include a twist you did not see coming.',
    targetSeconds: 90,
  },
  {
    id: 't-anecdote-3',
    text: 'Tell a story about a small decision that led to a big change in your life.',
    category: 'personal anecdote',
    baseDifficulty: 3,
    constraint: 'Use exactly 3 sensory details.',
    targetSeconds: 100,
  },
  {
    id: 't-hypothetical-1',
    text: 'If you woke up tomorrow with one new skill, what would it be and how would your week change?',
    category: 'hypothetical',
    baseDifficulty: 2,
    targetSeconds: 90,
  },
  {
    id: 't-hypothetical-2',
    text: 'Imagine you could send a message back to yourself five years ago. Tell it as a story.',
    category: 'hypothetical',
    baseDifficulty: 3,
    constraint: 'Include a clear beginning, middle, and end.',
    targetSeconds: 100,
  },
  {
    id: 't-persuasive-1',
    text: 'Convince a friend to try something you love, using a personal story as evidence.',
    category: 'persuasive',
    baseDifficulty: 3,
    targetSeconds: 90,
  },
  {
    id: 't-persuasive-2',
    text: 'Make the case for why failure was the best thing that happened to you, with a specific example.',
    category: 'persuasive',
    baseDifficulty: 4,
    constraint: 'No filler words.',
    targetSeconds: 100,
  },
  {
    id: 't-descriptive-1',
    text: 'Describe the most memorable meal you have ever had.',
    category: 'descriptive',
    baseDifficulty: 1,
    targetSeconds: 75,
  },
  {
    id: 't-descriptive-2',
    text: 'Describe a place from your childhood in enough detail that a stranger could picture it.',
    category: 'descriptive',
    baseDifficulty: 2,
    constraint: 'Use 3 sensory details.',
    targetSeconds: 90,
  },
  {
    id: 't-humorous-1',
    text: 'Tell a story about the most embarrassing thing that has happened to you in public.',
    category: 'humorous',
    baseDifficulty: 2,
    targetSeconds: 90,
  },
  {
    id: 't-humorous-2',
    text: 'Tell a story about a plan that went hilariously wrong.',
    category: 'humorous',
    baseDifficulty: 3,
    constraint: 'Include a twist ending.',
    targetSeconds: 100,
  },
  {
    id: 't-hypothetical-3',
    text: 'If your life were a movie, describe the scene that would open it — and why.',
    category: 'hypothetical',
    baseDifficulty: 4,
    constraint: 'Use exactly 3 sensory details and a clear arc.',
    targetSeconds: 110,
  },
  {
    id: 't-anecdote-4',
    text: 'Tell a story about the last time you changed your mind about someone.',
    category: 'personal anecdote',
    baseDifficulty: 2,
    targetSeconds: 90,
  },
  {
    id: 't-anecdote-6',
    text: 'Tell a story about the best piece of advice you ever ignored.',
    category: 'personal anecdote',
    baseDifficulty: 4,
    constraint: 'Include a clear beginning, middle, and end.',
    targetSeconds: 105,
  },
  {
    id: 't-hypothetical-5',
    text: 'Imagine you had to leave your city tonight and never come back. Tell the story of your last hour there.',
    category: 'hypothetical',
    baseDifficulty: 5,
    constraint: 'Use exactly 3 sensory details, no filler words.',
    targetSeconds: 115,
  },
  {
    id: 't-persuasive-4',
    text: 'Convince a skeptical friend that a habit of yours is actually worth adopting, using one story as proof.',
    category: 'persuasive',
    baseDifficulty: 5,
    constraint: 'Include a twist and no filler words.',
    targetSeconds: 115,
  },
  {
    id: 't-descriptive-3',
    text: 'Describe the room you spent the most time in as a kid.',
    category: 'descriptive',
    baseDifficulty: 1,
    targetSeconds: 75,
  },
  {
    id: 't-descriptive-4',
    text: 'Describe a person you have never met but feel like you know well.',
    category: 'descriptive',
    baseDifficulty: 3,
    constraint: 'Use exactly 3 sensory details.',
    targetSeconds: 95,
  },
  {
    id: 't-humorous-3',
    text: 'Tell a story about the worst piece of advice you ever gave someone else.',
    category: 'humorous',
    baseDifficulty: 1,
    targetSeconds: 80,
  },
  {
    id: 't-humorous-4',
    text: 'Tell a story about a time you were confident you were right — and were not.',
    category: 'humorous',
    baseDifficulty: 4,
    constraint: 'Include a twist ending.',
    targetSeconds: 105,
  },
]

function seededHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/** Deterministic "today's topic" tied to date + current difficulty, so the same day always shows the same topic. */
export function getTopicForDate(dateISO: string, difficultyLevel: number): Topic {
  const candidates = TOPIC_BANK.filter(
    (t) => Math.abs(t.baseDifficulty - difficultyLevel) <= 1,
  )
  const pool = candidates.length > 0 ? candidates : TOPIC_BANK
  const idx = seededHash(dateISO + difficultyLevel) % pool.length
  return pool[idx]
}
