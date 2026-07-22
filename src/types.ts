export type SubMetric = 'structure' | 'fluency' | 'vocabulary' | 'pacing'

export interface Topic {
  id: string
  text: string
  category: 'personal anecdote' | 'hypothetical' | 'persuasive' | 'descriptive' | 'humorous'
  baseDifficulty: number // 1-5
  constraint?: string
  targetSeconds: number
}

export interface Exercise {
  id: string
  text: string
  targetMetric: SubMetric
  difficulty: number
}

export interface RuleMetrics {
  wpm: number
  fillerCount: number
  fillerWords: { word: string; count: number }[]
  longPauseCount: number
  vocabDiversity: number // 0-1
}

export interface LlmScores {
  structure: number // 0-100
  coherence: number
  engagement: number
  constraintAdherence: number
}

export interface TranscriptToken {
  word: string
  start: number
  end: number
  isFiller: boolean
  pauseBefore: number // seconds of silence before this word
}

export interface Session {
  id: string
  date: string // ISO date, yyyy-mm-dd
  topic: Topic
  difficultyLevel: number
  durationSeconds: number
  transcript: TranscriptToken[]
  metrics: RuleMetrics
  llmScores: LlmScores
  subScores: Record<SubMetric, number> // 0-100, combined per-category
  overallScore: number
  suggestions: string[]
  summary: string
  nextExercise: Exercise
  /** Whether the transcript came from real in-browser speech recognition or the simulated fallback. */
  transcriptionSource: 'live' | 'simulated'
  /** Base64 data URL of the recorded audio, kept for the last 7 days per PRD 6.2. */
  audioRef?: string
  /** Raw text exactly as returned by the speech recognizer, before token cleanup — only set for transcriptionSource: 'live'. */
  rawLiveTranscript?: string
  /** Why this session ended up 'simulated' despite a real recording attempt, or diagnostics from a 'live' one — surfaced in the UI instead of guessed at. */
  transcriptionDebug?: { reason: string; lastError: string | null; restartCount: number }
}

export interface AppState {
  difficultyLevel: number
  sessions: Session[]
  pendingExercise?: Exercise
}
