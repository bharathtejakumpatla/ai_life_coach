import type { LlmScores, RuleMetrics, Topic, TranscriptToken } from '../types'

const SENSORY_WORDS = [
  'smell', 'smelled', 'scent', 'taste', 'tasted', 'sound', 'sounded', 'heard', 'loud', 'quiet',
  'bright', 'dark', 'warm', 'cold', 'cool', 'hot', 'soft', 'rough', 'smooth', 'sweet', 'bitter',
  'sour', 'texture', 'touch', 'felt', 'glow', 'shiny', 'sticky', 'crisp', 'fragrant',
]
const TWIST_WORDS = ['but', 'suddenly', 'turned out', 'surprisingly', 'little did', 'actually', 'until', 'unexpected']

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function countMatches(words: string[], vocabulary: string[]): number {
  const set = new Set(words)
  return vocabulary.filter((v) => (v.includes(' ') ? words.join(' ').includes(v) : set.has(v))).length
}

/**
 * Stands in for the LLM rubric call (PRD 6.4B) when we have a real transcript
 * but no LLM backend wired up yet — scores are derived from actual transcript
 * signal (segment count, vocabulary, constraint keywords) rather than random,
 * so real speaking behavior visibly moves the score. Swap this for an actual
 * rubric-prompted LLM call once the backend exists.
 */
export function heuristicLlmScores(transcript: TranscriptToken[], metrics: RuleMetrics, topic: Topic): LlmScores {
  const words = transcript.map((t) => t.word.toLowerCase())
  const wordCount = words.length
  const beatCount = 1 + transcript.filter((t) => t.pauseBefore > 1.0).length
  const fillerRate = metrics.fillerCount / Math.max(1, wordCount)

  const lengthFit = wordCount === 0 ? 0 : clamp(100 - Math.abs(wordCount - 150) / 2, 20, 100)

  const structure = Math.round(
    clamp(40 + Math.min(beatCount, 4) * 9 + lengthFit * 0.2 - fillerRate * 60, 0, 100),
  )

  const coherence = Math.round(
    clamp(65 - fillerRate * 150 - metrics.longPauseCount * 5 + metrics.vocabDiversity * 20, 0, 100),
  )

  const engagement = Math.round(clamp(35 + metrics.vocabDiversity * 55 + Math.min(wordCount / 3, 20), 0, 100))

  let constraintAdherence = 100
  if (topic.constraint) {
    const c = topic.constraint.toLowerCase()
    if (c.includes('sensory')) {
      constraintAdherence = clamp(countMatches(words, SENSORY_WORDS) * 30, 10, 100)
    } else if (c.includes('twist')) {
      constraintAdherence = clamp(countMatches(words, TWIST_WORDS) * 35, 15, 100)
    } else if (c.includes('no filler')) {
      constraintAdherence = metrics.fillerCount === 0 ? 100 : clamp(100 - metrics.fillerCount * 20, 0, 90)
    } else if (c.includes('beginning') || c.includes('arc')) {
      constraintAdherence = clamp(beatCount * 22, 20, 100)
    } else {
      constraintAdherence = lengthFit
    }
  }

  return { structure, coherence, engagement, constraintAdherence: Math.round(constraintAdherence) }
}
