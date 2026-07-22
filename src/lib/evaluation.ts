import type { LlmScores, RuleMetrics, Session, SubMetric, Topic, TranscriptToken } from '../types'
import { pickExerciseFor } from './exercises'
import { heuristicLlmScores } from './heuristicScoring'

export const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically']

// A handful of generic, first-person story bodies long enough to be trimmed
// down to any 60-120s target. Standing in for a real Whisper transcript,
// used only for seed/demo history — a live recording uses the real transcript.
const STORY_BANK: string[] = [
  `it started on a regular tuesday when i decided to take a different route home from work. the street was quieter than i expected and the light was doing that golden thing right before sunset. i noticed an old bookshop tucked between two buildings that i had walked past a hundred times without seeing. i went inside on a whim and the owner was sitting behind a desk stacked with receipts. we started talking about nothing in particular and somehow ended up talking for almost an hour. by the time i left i had bought a book i never would have picked up on my own and a story i still tell people. sometimes the best things happen when you are not looking for them at all and that walk reminded me why i like wandering without a plan.`,
  `a few years ago i signed up for a class i was completely unqualified for. i told myself i would just observe from the back row and never say anything. on the first day the instructor asked everyone to introduce themselves and explain why they were there. when it got to me my mind went blank and i just said the truth which was that i was scared and curious at the same time. instead of laughing the room nodded like they understood exactly what i meant. that class turned into one of the hardest and most rewarding things i did that year. i learned that admitting you do not know something is usually the fastest way to actually learn it.`,
  `my family used to spend every summer at a small lake house that barely had any cell signal. i complained about it constantly as a kid because i felt disconnected from everyone. one evening the power went out during a storm and my dad pulled out an old deck of cards by candlelight. we played until almost midnight and laughed harder than i remember laughing in a long time. it is strange how a night with nothing to do became one of the clearest memories i have from that whole decade. now when my phone buzzes too much i think about that table and the candle and how little we actually needed.`,
  `i once agreed to help a friend move apartments thinking it would take an afternoon. the elevator broke halfway through so we ended up carrying everything up six flights of stairs. by the third trip we were both exhausted and started making up ridiculous names for every piece of furniture just to keep going. what should have been a miserable day turned into one of my favorite memories with that friend. we still bring up the couch that almost did not fit around the stairwell corner. it taught me that the moments that go wrong are usually the ones you end up telling stories about later.`,
  `there was a period where i was convinced i was bad at public speaking after one embarrassing presentation in school. for years i avoided any situation where i had to talk in front of a group. eventually a job forced my hand and i had to present to a room of people i barely knew. i was shaking through the first two minutes but then something shifted and i just started talking like i would to a friend. afterward a coworker told me it was the clearest explanation they had heard all quarter. that one presentation did not fix everything overnight but it proved the story i had been telling myself was wrong.`,
  `my grandmother taught me to cook using no recipes at all, just taste and memory. one weekend i tried to recreate her soup completely from scratch without calling her for help. i got the proportions wrong twice and the kitchen smelled like burnt garlic for a day. on the third attempt something clicked and it actually tasted like her version. i called her immediately and she just laughed and said that is exactly how she learned too, by ruining it a few times first. now every time i make that soup i think about how much of what we inherit is not written down anywhere at all.`,
]

function seededRandom(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) || 1
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** Rule-based metrics (PRD 6.4A) computed directly from transcript tokens — works the same whether the transcript is real or simulated. */
export function computeRuleMetrics(transcript: TranscriptToken[]): RuleMetrics {
  const actualDuration = transcript.length > 0 ? transcript[transcript.length - 1].end : 0
  const fillerTokens = transcript.filter((tok) => tok.isFiller)
  const fillerCount = fillerTokens.length
  const fillerCounts = new Map<string, number>()
  for (const tok of fillerTokens) fillerCounts.set(tok.word, (fillerCounts.get(tok.word) ?? 0) + 1)

  const nonFillerWords = transcript.filter((tok) => !tok.isFiller).map((tok) => tok.word.toLowerCase())
  const uniqueWords = new Set(nonFillerWords)
  const vocabDiversity = nonFillerWords.length > 0 ? uniqueWords.size / nonFillerWords.length : 0
  const longPauseCount = transcript.filter((tok) => tok.pauseBefore > 1.5).length
  const wpm = actualDuration > 0 ? Math.round((transcript.length / actualDuration) * 60) : 0

  return {
    wpm,
    fillerCount,
    fillerWords: Array.from(fillerCounts.entries()).map(([word, count]) => ({ word, count })),
    longPauseCount,
    vocabDiversity: Math.round(vocabDiversity * 100) / 100,
  }
}

/** Combines rule-based metrics (40%) with the LLM rubric (60%) per PRD 6.4, and derives the four UI sub-scores. */
export function computeScores(
  metrics: RuleMetrics,
  llmScores: LlmScores,
  durationSeconds: number,
): { subScores: Record<SubMetric, number>; overallScore: number } {
  const fillerPerMin = durationSeconds > 0 ? metrics.fillerCount / (durationSeconds / 60) : 0
  const fillerScore = clamp(100 - fillerPerMin * 11, 0, 100)
  const pauseScore = clamp(100 - metrics.longPauseCount * 16, 0, 100)
  const wpmScore = metrics.wpm > 0 ? clamp(100 - (Math.abs(metrics.wpm - 135) / 135) * 140, 0, 100) : 40
  const vocabScore = clamp(metrics.vocabDiversity * 145, 0, 100)

  const ruleBasedComposite = (wpmScore + fillerScore + pauseScore + vocabScore) / 4
  const llmComposite =
    (llmScores.structure + llmScores.coherence + llmScores.engagement + llmScores.constraintAdherence) / 4
  const overallScore = Math.round(ruleBasedComposite * 0.4 + llmComposite * 0.6)

  const subScores: Record<SubMetric, number> = {
    structure: llmScores.structure,
    fluency: Math.round((fillerScore + pauseScore + llmScores.coherence) / 3),
    vocabulary: Math.round(vocabScore * 0.7 + llmScores.engagement * 0.3),
    pacing: Math.round(wpmScore * 0.7 + pauseScore * 0.3),
  }

  return { subScores, overallScore }
}

interface AssembleArgs {
  topic: Topic
  difficultyLevel: number
  date: string
  transcript: TranscriptToken[]
  llmScores: LlmScores
  transcriptionSource: 'live' | 'simulated'
  audioRef?: string
  rawLiveTranscript?: string
}

/** Shared final step: rule metrics -> scores -> suggestions/summary -> next exercise -> Session. */
export function assembleSession(id: string, args: AssembleArgs): Session {
  const { topic, difficultyLevel, date, transcript, llmScores, transcriptionSource, audioRef, rawLiveTranscript } = args
  const metrics = computeRuleMetrics(transcript)
  const durationSeconds = transcript.length > 0 ? transcript[transcript.length - 1].end : 0
  const { subScores, overallScore } = computeScores(metrics, llmScores, durationSeconds)

  const weakestMetric = (Object.entries(subScores) as [SubMetric, number][]).sort((a, b) => a[1] - b[1])[0][0]
  const hasConstraint = Boolean(topic.constraint)
  const suggestions = buildSuggestions({ metrics, transcript, subScores, topic, hasConstraint, llmScores })
  const summary = buildSummary(overallScore)
  const nextExercise = pickExerciseFor(weakestMetric, difficultyLevel)

  return {
    id,
    date,
    topic,
    difficultyLevel,
    durationSeconds: Math.round(durationSeconds),
    transcript,
    metrics,
    llmScores,
    subScores,
    overallScore,
    suggestions,
    summary,
    nextExercise,
    transcriptionSource,
    audioRef,
    rawLiveTranscript,
  }
}

interface GenerateOptions {
  topic: Topic
  difficultyLevel: number
  durationSeconds: number
  date: string
  /** 0 (rough session) - 1 (great session). Defaults to a random-but-seeded roll. */
  qualityRoll?: number
  /** Extra wpm offset applied to the simulated pace, used to seed demo data with a persistent pacing weakness. */
  paceBias?: number
}

/**
 * Stands in for the real pipeline (Whisper transcription + LLM rubric scoring)
 * when there's no real recording to evaluate — used for seed/demo history and
 * as a fallback if live transcription isn't available. Deterministic per
 * session id so results are reproducible, but varies across sessions like a
 * real speaker would.
 */
export function generateSession(id: string, opts: GenerateOptions): Session {
  const { topic, difficultyLevel, durationSeconds, date } = opts
  const seed = hashString(id)
  const rand = seededRandom(seed)
  const qualityRoll = opts.qualityRoll ?? rand()

  const story = STORY_BANK[hashString(id + topic.id) % STORY_BANK.length]
  const words = story.split(/\s+/)

  // Target word count from an ideal-ish pace, then trim/pad to fit the story bank text.
  const idealWpm = 125 + qualityRoll * 20 + (opts.paceBias ?? 0)
  const targetWordCount = clamp(Math.round((durationSeconds / 60) * idealWpm), 20, words.length)
  const baseWords = words.slice(0, targetWordCount)

  const fillerPerMinute = 8 - qualityRoll * 7 // worse sessions ~8/min, great sessions ~1/min
  const expectedFillerCount = Math.round((durationSeconds / 60) * fillerPerMinute)

  const withFillers: string[] = []
  let fillerBudget = expectedFillerCount
  for (let i = 0; i < baseWords.length; i++) {
    withFillers.push(baseWords[i])
    const remainingSlots = baseWords.length - i
    if (fillerBudget > 0 && remainingSlots > 0 && rand() < fillerBudget / remainingSlots) {
      withFillers.push(FILLER_WORDS[Math.floor(rand() * FILLER_WORDS.length)])
      fillerBudget--
    }
  }

  // Long pauses: worse sessions get more/longer gaps.
  const longPauseCount = Math.round((1 - qualityRoll) * 4 * (durationSeconds / 90))
  const pausePositions = new Set<number>()
  while (pausePositions.size < longPauseCount && pausePositions.size < withFillers.length - 2) {
    pausePositions.add(1 + Math.floor(rand() * (withFillers.length - 2)))
  }

  const totalWords = withFillers.length
  const totalPauseSeconds = pausePositions.size * (1.8 + (1 - qualityRoll) * 2.5)
  const speakingSeconds = Math.max(10, durationSeconds - totalPauseSeconds)
  const avgWordDuration = speakingSeconds / totalWords

  let t = 0
  const transcript: TranscriptToken[] = withFillers.map((word, i) => {
    const isFiller = FILLER_WORDS.includes(word)
    let pauseBefore = 0
    if (pausePositions.has(i)) {
      pauseBefore = 1.8 + (1 - qualityRoll) * 2.5 * rand()
    }
    const start = t + pauseBefore
    const end = start + avgWordDuration
    t = end
    return { word, start, end, isFiller, pauseBefore }
  })

  const hasConstraint = Boolean(topic.constraint)
  const llmScores: LlmScores = {
    structure: Math.round(clamp(45 + qualityRoll * 50 + (rand() - 0.5) * 10, 0, 100)),
    coherence: Math.round(clamp(50 + qualityRoll * 45 + (rand() - 0.5) * 10, 0, 100)),
    engagement: Math.round(clamp(40 + qualityRoll * 55 + (rand() - 0.5) * 12, 0, 100)),
    constraintAdherence: hasConstraint
      ? Math.round(clamp(35 + qualityRoll * 60 + (rand() - 0.5) * 15, 0, 100))
      : 100,
  }

  return assembleSession(id, { topic, difficultyLevel, date, transcript, llmScores, transcriptionSource: 'simulated' })
}

interface LiveEvaluateOptions {
  topic: Topic
  difficultyLevel: number
  date: string
  transcript: TranscriptToken[]
  audioRef?: string
  rawLiveTranscript?: string
}

/**
 * Evaluates a real, live-recorded session: rule-based metrics come straight
 * from the actual transcript, and the rubric scores are derived heuristically
 * from that same transcript (see heuristicScoring.ts) rather than an LLM call.
 */
export function evaluateLiveSession(id: string, opts: LiveEvaluateOptions): Session {
  const { topic, difficultyLevel, date, transcript, audioRef, rawLiveTranscript } = opts
  const metrics = computeRuleMetrics(transcript)
  const llmScores = heuristicLlmScores(transcript, metrics, topic)
  return assembleSession(id, {
    topic,
    difficultyLevel,
    date,
    transcript,
    llmScores,
    transcriptionSource: 'live',
    audioRef,
    rawLiveTranscript,
  })
}

function buildSuggestions(args: {
  metrics: RuleMetrics
  transcript: TranscriptToken[]
  subScores: Record<SubMetric, number>
  topic: Topic
  hasConstraint: boolean
  llmScores: LlmScores
}): string[] {
  const { metrics, transcript, subScores, topic, hasConstraint, llmScores } = args
  const suggestions: string[] = []

  const longestPause = [...transcript].sort((a, b) => b.pauseBefore - a.pauseBefore)[0]
  if (longestPause && longestPause.pauseBefore > 1.5) {
    const idx = transcript.indexOf(longestPause)
    const before = transcript
      .slice(Math.max(0, idx - 3), idx)
      .map((t) => t.word)
      .join(' ')
    suggestions.push(
      `You paused for ${longestPause.pauseBefore.toFixed(1)}s after "${before || '…'}" — try a transition phrase like "which led to" instead of trailing off.`,
    )
  }

  if (metrics.fillerCount > 0) {
    const top = [...metrics.fillerWords].sort((a, b) => b.count - a.count)[0]
    suggestions.push(
      `You said "${top.word}" ${top.count} time${top.count > 1 ? 's' : ''} — swap it for a silent pause to sound more deliberate.`,
    )
  }

  if (subScores.pacing < 65) {
    suggestions.push(
      metrics.wpm > 150
        ? `You spoke at ${metrics.wpm} wpm, faster than the ideal 120-150 range — slow down on key story beats.`
        : `You spoke at ${metrics.wpm} wpm, slower than the ideal 120-150 range — tighten up your sentences to keep momentum.`,
    )
  }

  if (subScores.structure < 65) {
    suggestions.push('Your story\'s arc was hard to follow — try explicitly signposting the beginning, turning point, and ending.')
  }

  if (subScores.vocabulary < 65) {
    suggestions.push('You repeated several words — swap in more specific or vivid alternatives to keep the listener engaged.')
  }

  if (hasConstraint && llmScores.constraintAdherence < 60) {
    suggestions.push(`This topic asked you to "${topic.constraint}" — that constraint wasn't clearly met, try building it in earlier next time.`)
  }

  if (suggestions.length === 0) {
    suggestions.push('Strong, clean delivery — push your difficulty by adding a tighter time limit next time.')
  }

  return suggestions.slice(0, 3)
}

function buildSummary(overallScore: number): string {
  if (overallScore >= 85) return 'Excellent session — this was some of your clearest storytelling yet.'
  if (overallScore >= 70) return 'Solid session with a clear story — a few specific tweaks will sharpen it further.'
  if (overallScore >= 50) return 'Decent attempt — the bones of a good story are there, worth another rep.'
  return 'Rough session, and that\'s fine — use tomorrow\'s warm-up to target the weak spot directly.'
}
