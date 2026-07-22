import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/AppStore'
import { evaluateLiveSession, generateSession } from '../../lib/evaluation'
import { createLiveTranscriber, isLiveTranscriptionSupported, type LiveTranscriber } from '../../lib/liveTranscription'
import type { TranscriptToken } from '../../types'

type Phase = 'idle' | 'recording' | 'recorded' | 'evaluating' | 'error'

const MIN_TARGET = 60
const MAX_TARGET = 120

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.floor(totalSeconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function RecordPage() {
  const { todayTopic, todaySession, state, addSession } = useAppStore()
  const navigate = useNavigate()
  // A retry keeps the same prompt the day started with, instead of re-rolling it.
  const topic = todaySession?.topic ?? todayTopic

  const [phase, setPhase] = useState<Phase>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [simulated, setSimulated] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [interimCaption, setInterimCaption] = useState('')

  const speechSupported = isLiveTranscriptionSupported()

  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioBlobRef = useRef<Blob | null>(null)
  const transcriberRef = useRef<LiveTranscriber | null>(null)
  const transcriptRef = useRef<TranscriptToken[]>([])
  const rawTranscriptRef = useRef<string>('')
  const diagRef = useRef<{ lastError: string | null; restartCount: number }>({ lastError: null, restartCount: 0 })
  const intervalRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  const hardStopTimerRef = useRef<number | null>(null)
  const stopRef = useRef<() => void>(() => {})
  const stoppingRef = useRef(false)

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      if (hardStopTimerRef.current) window.clearTimeout(hardStopTimerRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startTimer = () => {
    startRef.current = Date.now()
    intervalRef.current = window.setInterval(() => {
      setElapsed((Date.now() - startRef.current) / 1000)
    }, 200)
  }

  const stopTimer = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  const startRecording = async () => {
    setErrorMessage(null)
    stoppingRef.current = false
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      audioBlobRef.current = null
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        audioBlobRef.current = blob
        setAudioUrl(URL.createObjectURL(blob))
        streamRef.current?.getTracks().forEach((t) => t.stop())
      }
      recorderRef.current = recorder
      recorder.start()

      transcriptRef.current = []
      setInterimCaption('')
      if (speechSupported) {
        const transcriber = createLiveTranscriber((text) => setInterimCaption(text))
        transcriberRef.current = transcriber
        transcriber.start()
      } else {
        transcriberRef.current = null
      }

      setSimulated(false)
      setElapsed(0)
      startTimer()
      hardStopTimerRef.current = window.setTimeout(() => stopRef.current(), MAX_TARGET * 1000)
      setPhase('recording')
    } catch {
      setErrorMessage('Microphone access was blocked or unavailable.')
      setPhase('error')
    }
  }

  const startSimulatedRecording = () => {
    setErrorMessage(null)
    stoppingRef.current = false
    setSimulated(true)
    setAudioUrl(null)
    audioBlobRef.current = null
    transcriptRef.current = []
    rawTranscriptRef.current = ''
    transcriberRef.current = null
    setInterimCaption('')
    setElapsed(0)
    startTimer()
    hardStopTimerRef.current = window.setTimeout(() => stopRef.current(), MAX_TARGET * 1000)
    setPhase('recording')
  }

  const stop = async () => {
    if (stoppingRef.current) return
    stoppingRef.current = true
    stopTimer()
    if (hardStopTimerRef.current) {
      window.clearTimeout(hardStopTimerRef.current)
      hardStopTimerRef.current = null
    }
    if (simulated) {
      setPhase('recorded')
      return
    }
    recorderRef.current?.stop()
    if (transcriberRef.current) {
      const result = await transcriberRef.current.stop()
      transcriptRef.current = result.tokens
      rawTranscriptRef.current = result.rawText
      diagRef.current = { lastError: result.lastError, restartCount: result.restartCount }
    }
    setInterimCaption('')
    setPhase('recorded')
  }
  stopRef.current = stop

  const reRecord = () => {
    stoppingRef.current = false
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    audioBlobRef.current = null
    transcriptRef.current = []
    rawTranscriptRef.current = ''
    setElapsed(0)
    setPhase('idle')
  }

  const submit = async () => {
    setPhase('evaluating')
    const id = crypto.randomUUID()
    const date = new Date().toISOString().slice(0, 10)
    const durationSeconds = Math.max(20, Math.round(elapsed))

    const audioRef = audioBlobRef.current ? await blobToDataUrl(audioBlobRef.current) : undefined
    const liveTranscript = transcriptRef.current
    const rawLiveTranscript = rawTranscriptRef.current
    const { lastError, restartCount } = diagRef.current
    const usingLive = liveTranscript.length > 0

    const reason = usingLive
      ? 'real speech recognition produced a transcript'
      : simulated
        ? 'no microphone — used the simulated recording flow'
        : !speechSupported
          ? "this browser doesn't support the Web Speech API"
          : lastError
            ? `speech recognition errored (${lastError}) and never captured any words`
            : 'speech recognition ran but returned zero words — check mic input level/permissions'

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[RecordPage] submit — source: ${usingLive ? 'LIVE' : 'SIMULATED'} — ${reason}`, {
        rawLiveTranscript,
        tokenCount: liveTranscript.length,
        lastError,
        restartCount,
      })
    }

    // Simulate the ~1-2s "transcribing + evaluating" turnaround even though scoring is instant client-side.
    window.setTimeout(() => {
      const session = usingLive
        ? evaluateLiveSession(id, {
            topic,
            difficultyLevel: state.difficultyLevel,
            date,
            transcript: liveTranscript,
            audioRef,
            rawLiveTranscript,
          })
        : generateSession(id, {
            topic,
            difficultyLevel: state.difficultyLevel,
            durationSeconds,
            date,
            qualityRoll: Math.random(),
          })
      addSession({ ...session, audioRef: session.audioRef ?? audioRef, transcriptionDebug: { reason, lastError, restartCount } })
      navigate(`/storytelling/results/${id}`)
    }, 1200)
  }

  const inTargetRange = elapsed >= MIN_TARGET && elapsed <= MAX_TARGET

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
          {todaySession ? "Today's topic (retry)" : "Today's topic"}
        </p>
        <p className="mt-1 text-base font-medium">{topic.text}</p>
        {topic.constraint && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Constraint: {topic.constraint}</p>
        )}
      </div>

      <div className="flex flex-col items-center gap-6 rounded-2xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="text-center">
          <p className="font-mono text-5xl tabular-nums">{formatTime(elapsed)}</p>
          <p className={`mt-2 text-xs ${inTargetRange ? 'text-good' : 'text-neutral-400'}`}>
            {phase === 'recording' || phase === 'recorded'
              ? inTargetRange
                ? 'Nice — in the 60–120s target range'
                : 'Aim for 60–120 seconds (auto-stops at 2:00)'
              : 'Aim for 60–120 seconds — recording stops automatically at 2:00'}
          </p>
          {phase === 'idle' && !simulated && (
            <p className="mt-1 text-[11px] text-neutral-400">
              {speechSupported ? 'Live transcription is on for this browser' : 'Live transcription is unavailable in this browser — feedback will use a simulated transcript'}
            </p>
          )}
        </div>

        {phase === 'idle' && (
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-sm active:scale-95"
          >
            <span className="h-3 w-3 rounded-full bg-white" />
            Record
          </button>
        )}

        {phase === 'error' && (
          <div className="w-full space-y-3 text-center">
            <p className="text-sm text-[#d03b3b]">{errorMessage}</p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={startRecording}
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={startSimulatedRecording}
                className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white"
              >
                Continue without mic
              </button>
            </div>
          </div>
        )}

        {phase === 'recording' && (
          <div className="flex w-full flex-col items-center gap-4">
            {interimCaption && (
              <p className="max-w-full text-center text-sm italic text-neutral-400">"{interimCaption}"</p>
            )}
            <button
              type="button"
              onClick={stop}
              className="flex items-center gap-2 rounded-full bg-[#d03b3b] px-6 py-3 text-sm font-semibold text-white shadow-sm active:scale-95"
            >
              <span className="h-3 w-3 rounded-sm bg-white" />
              Stop
            </button>
          </div>
        )}

        {phase === 'recorded' && (
          <div className="w-full space-y-4">
            {audioUrl ? (
              <audio controls src={audioUrl} className="w-full" />
            ) : (
              <p className="text-center text-sm text-neutral-400">Simulated recording — no audio playback available.</p>
            )}
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={reRecord}
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
              >
                Re-record
              </button>
              <button
                type="button"
                onClick={submit}
                className="rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {phase === 'evaluating' && (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-500" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Transcribing and evaluating your story…</p>
          </div>
        )}
      </div>
    </div>
  )
}
