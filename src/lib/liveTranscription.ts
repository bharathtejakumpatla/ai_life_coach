import type { TranscriptToken } from '../types'
import { FILLER_WORDS } from './evaluation'

// Chrome/Edge only — no official TS lib types for the Web Speech API.
type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: any) => void) | null
  onend: (() => void) | null
  onerror: ((event: any) => void) | null
  start: () => void
  stop: () => void
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as any
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

// eslint-disable-next-line no-console
const debugLog = import.meta.env.DEV ? console.log.bind(console) : () => {}

export function isLiveTranscriptionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null
}

const WORD_DURATION_ESTIMATE = 0.32 // seconds/word, used to split a recognized gap into "speaking" vs "pause"
const LONG_GAP_THRESHOLD = 1.2

interface Segment {
  words: string[]
  firedAt: number // seconds since recording start
}

export interface LiveTranscriptionResult {
  tokens: TranscriptToken[]
  /** The exact concatenated text the recognizer returned, before any cleanup/tokenizing — for verifying real transcription happened. */
  rawText: string
  segmentCount: number
  /** The last error code the recognizer reported (e.g. "no-speech", "not-allowed", "audio-capture", "network"), if any. */
  lastError: string | null
  restartCount: number
}

export interface LiveTranscriber {
  start: () => void
  /** Stops recognition and resolves with the reconstructed transcript tokens plus the raw recognizer text. */
  stop: () => Promise<LiveTranscriptionResult>
  /** Latest interim (not-yet-final) text, for a live caption preview. */
  onInterim?: (text: string) => void
}

/**
 * Wraps the browser's built-in speech recognition to produce a real transcript
 * while recording, in place of a Whisper backend call. Word-level timestamps
 * aren't available from this API, so timing is approximated: each finalized
 * phrase is stamped with the time it arrived, then split evenly across an
 * estimated speaking duration, with any leftover gap recorded as a pause.
 *
 * Note: Chrome's implementation processes audio via Google's speech service,
 * not fully on-device — a real backend would swap this for a local Whisper call.
 */
export function createLiveTranscriber(onInterim?: (text: string) => void): LiveTranscriber {
  const Ctor = getSpeechRecognitionCtor()
  const segments: Segment[] = []
  let startedAt = 0
  let recognition: SpeechRecognitionLike | null = null
  let resolveStop: ((result: LiveTranscriptionResult) => void) | null = null
  let stopped = false
  let lastError: string | null = null
  let restartCount = 0
  let restartTimer: number | null = null

  function rawText(): string {
    return segments.map((s) => s.words.join(' ')).join(' ').trim()
  }

  function buildResult(): LiveTranscriptionResult {
    return { tokens: buildTokens(), rawText: rawText(), segmentCount: segments.length, lastError, restartCount }
  }

  function buildTokens(): TranscriptToken[] {
    const tokens: TranscriptToken[] = []
    let prevEnd = 0
    for (const seg of segments) {
      const words = seg.words.filter(Boolean)
      if (words.length === 0) continue
      const gap = Math.max(0, seg.firedAt - prevEnd)
      const estimatedSpeakingTime = Math.min(gap, words.length * WORD_DURATION_ESTIMATE)
      const pauseBeforeSegment = Math.max(0, gap - estimatedSpeakingTime)
      const wordDuration = estimatedSpeakingTime / words.length

      let t = prevEnd + pauseBeforeSegment
      words.forEach((word, i) => {
        const clean = word.toLowerCase().replace(/[.,!?;:]/g, '')
        const start = t
        const end = start + wordDuration
        tokens.push({
          word: clean,
          start,
          end,
          isFiller: FILLER_WORDS.includes(clean),
          pauseBefore: i === 0 && pauseBeforeSegment > LONG_GAP_THRESHOLD ? pauseBeforeSegment : 0,
        })
        t = end
      })
      prevEnd = seg.firedAt
    }
    return tokens
  }

  return {
    start() {
      if (!Ctor) return
      startedAt = performance.now()
      recognition = new Ctor()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.onresult = (event: any) => {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const text = result[0].transcript as string
          if (result.isFinal) {
            const firedAt = (performance.now() - startedAt) / 1000
            segments.push({ words: text.trim().split(/\s+/), firedAt })
            debugLog(`[liveTranscription] final segment @ ${firedAt.toFixed(2)}s:`, JSON.stringify(text.trim()))
          } else {
            interim += text
          }
        }
        if (interim) onInterim?.(interim.trim())
      }
      recognition.onend = () => {
        if (!stopped) {
          // Chrome ends recognition on a silence timeout (e.g. "no-speech") even in continuous
          // mode. Restarting immediately inside this handler races the previous instance's
          // teardown and throws InvalidStateError, which silently kills transcription for the
          // rest of the take — so restart on a short delay instead, and log every restart.
          restartCount++
          debugLog(`[liveTranscription] recognition ended unexpectedly (lastError: ${lastError ?? 'none'}) — restarting (#${restartCount})`)
          restartTimer = window.setTimeout(() => {
            if (stopped) return
            try {
              recognition?.start()
            } catch (e) {
              debugLog('[liveTranscription] restart failed:', e)
            }
          }, 300)
          return
        }
        const result = buildResult()
        debugLog('[liveTranscription] stopped. raw text:', JSON.stringify(result.rawText), '· tokens:', result.tokens.length, '· restarts:', restartCount, '· lastError:', lastError)
        resolveStop?.(result)
      }
      recognition.onerror = (event: any) => {
        lastError = event?.error ?? 'unknown'
        debugLog('[liveTranscription] recognition error:', lastError)
      }
      try {
        recognition.start()
        debugLog('[liveTranscription] started (supported: true)')
      } catch {
        // ignore double-start races
      }
    },
    stop() {
      stopped = true
      if (restartTimer) window.clearTimeout(restartTimer)
      return new Promise<LiveTranscriptionResult>((resolve) => {
        if (!recognition) {
          resolve(buildResult())
          return
        }
        let settled = false
        resolveStop = (result) => {
          settled = true
          resolve(result)
        }
        // Safety net: if a restart was in flight when stop() was called, the stale
        // recognition instance may never fire another onend — don't hang forever.
        window.setTimeout(() => {
          if (!settled) resolve(buildResult())
        }, 1500)
        try {
          recognition.stop()
        } catch {
          if (!settled) resolve(buildResult())
        }
      })
    },
    onInterim,
  }
}
