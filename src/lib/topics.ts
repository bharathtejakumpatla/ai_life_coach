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
  {
    id: 't-anecdote-5',
    text: 'Tell a story about a time you tried something for the first time and were surprised by how it went.',
    category: 'personal anecdote',
    baseDifficulty: 1,
    targetSeconds: 80,
  },
  {
    id: 't-anecdote-7',
    text: 'Tell a story about a time you had to ask for help and it was harder than you expected.',
    category: 'personal anecdote',
    baseDifficulty: 3,
    constraint: 'Include a clear beginning, middle, and end.',
    targetSeconds: 100,
  },
  {
    id: 't-anecdote-8',
    text: 'Tell a story about a time you kept a promise even though it cost you something.',
    category: 'personal anecdote',
    baseDifficulty: 4,
    constraint: 'No filler words.',
    targetSeconds: 105,
  },
  {
    id: 't-anecdote-9',
    text: 'Tell a story about the moment you realized you had outgrown a place, person, or belief.',
    category: 'personal anecdote',
    baseDifficulty: 5,
    constraint: 'Use exactly 3 sensory details, no filler words.',
    targetSeconds: 115,
  },
  {
    id: 't-hypothetical-4',
    text: 'If you could instantly become an expert in one hobby, which would you pick and how would your first week go?',
    category: 'hypothetical',
    baseDifficulty: 1,
    targetSeconds: 80,
  },
  {
    id: 't-hypothetical-6',
    text: 'Imagine your pet (real or hypothetical) could talk for exactly one day. Tell the story of what happens.',
    category: 'hypothetical',
    baseDifficulty: 2,
    targetSeconds: 90,
  },
  {
    id: 't-hypothetical-7',
    text: 'Imagine you had to trade lives with a stranger for 24 hours. Tell the story of how that day unfolds.',
    category: 'hypothetical',
    baseDifficulty: 4,
    constraint: 'Include a clear beginning, middle, and end.',
    targetSeconds: 105,
  },
  {
    id: 't-hypothetical-8',
    text: 'Imagine you found a door in your home that leads to any place or time. Tell the story of where you go and what happens.',
    category: 'hypothetical',
    baseDifficulty: 5,
    constraint: 'Use exactly 3 sensory details, no filler words.',
    targetSeconds: 115,
  },
  {
    id: 't-persuasive-3',
    text: 'Convince a friend to join you on a trip you have been wanting to take, using a specific memory as your pitch.',
    category: 'persuasive',
    baseDifficulty: 2,
    targetSeconds: 90,
  },
  {
    id: 't-persuasive-5',
    text: 'Make the case for your favorite way to spend a weekend, using a story from a recent one.',
    category: 'persuasive',
    baseDifficulty: 1,
    targetSeconds: 80,
  },
  {
    id: 't-persuasive-6',
    text: 'Convince someone that a rule they think is silly is actually worth following, using a personal story.',
    category: 'persuasive',
    baseDifficulty: 4,
    constraint: 'No filler words.',
    targetSeconds: 105,
  },
  {
    id: 't-persuasive-7',
    text: 'Make the case that the hardest year of your life was also the most valuable one.',
    category: 'persuasive',
    baseDifficulty: 5,
    constraint: 'Include a twist and no filler words.',
    targetSeconds: 115,
  },
  {
    id: 't-descriptive-5',
    text: 'Describe your favorite spot to relax, in enough detail that someone else could find it.',
    category: 'descriptive',
    baseDifficulty: 1,
    targetSeconds: 75,
  },
  {
    id: 't-descriptive-6',
    text: 'Describe an object you own that has a story behind it.',
    category: 'descriptive',
    baseDifficulty: 3,
    constraint: 'Use exactly 3 sensory details.',
    targetSeconds: 95,
  },
  {
    id: 't-descriptive-7',
    text: 'Describe the sound, smell, and feel of a place you associate with a specific season.',
    category: 'descriptive',
    baseDifficulty: 4,
    constraint: 'Use exactly 3 sensory details.',
    targetSeconds: 105,
  },
  {
    id: 't-descriptive-8',
    text: 'Describe a moment of complete silence you remember vividly, and what led up to it.',
    category: 'descriptive',
    baseDifficulty: 5,
    constraint: 'Use exactly 3 sensory details, no filler words.',
    targetSeconds: 115,
  },
  {
    id: 't-humorous-5',
    text: 'Tell a story about a time technology completely embarrassed you at the worst possible moment.',
    category: 'humorous',
    baseDifficulty: 1,
    targetSeconds: 80,
  },
  {
    id: 't-humorous-6',
    text: 'Tell a story about the strangest thing you have ever seen someone do in public.',
    category: 'humorous',
    baseDifficulty: 3,
    constraint: 'Include a clear beginning, middle, and end.',
    targetSeconds: 95,
  },
  {
    id: 't-humorous-7',
    text: 'Tell a story about a time you tried to impress someone and it backfired spectacularly.',
    category: 'humorous',
    baseDifficulty: 4,
    constraint: 'Include a twist ending, no filler words.',
    targetSeconds: 105,
  },
  {
    id: 't-humorous-8',
    text: 'Tell a story about the most chaotic event you have ever been part of, and how it somehow worked out.',
    category: 'humorous',
    baseDifficulty: 5,
    constraint: 'Use exactly 3 sensory details, no filler words.',
    targetSeconds: 115,
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

/**
 * Deterministic "today's topic" tied to date + current difficulty, so the same day always shows
 * the same topic. `recentTopicIds` (most recent first) is used to skip topics already seen
 * recently, so the full bank cycles through before anything repeats — with 40 topics that's
 * roughly 30-45 days of daily practice before a repeat.
 */
export function getTopicForDate(dateISO: string, difficultyLevel: number, recentTopicIds: string[] = []): Topic {
  const candidates = TOPIC_BANK.filter(
    (t) => Math.abs(t.baseDifficulty - difficultyLevel) <= 1,
  )
  const pool = candidates.length > 0 ? candidates : TOPIC_BANK

  const recentSet = new Set(recentTopicIds.slice(0, TOPIC_BANK.length - 1))
  const unseen = pool.filter((t) => !recentSet.has(t.id))
  const finalPool = unseen.length > 0 ? unseen : pool

  const idx = seededHash(dateISO + difficultyLevel) % finalPool.length
  return finalPool[idx]
}
