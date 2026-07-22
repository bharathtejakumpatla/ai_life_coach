import type { Session } from '../types'
import { ScoreRing } from './ScoreRing'
import { SubScoreBar } from './SubScoreBar'
import { TranscriptView } from './TranscriptView'

export function SessionReport({ session }: { session: Session }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-6 text-center sm:flex-row sm:text-left dark:border-neutral-800 dark:bg-neutral-900">
        <ScoreRing score={session.overallScore} />
        <div className="flex-1">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Overall score</p>
          <p className="mt-1 text-base font-medium">{session.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 bg-white p-5 sm:grid-cols-2 dark:border-neutral-800 dark:bg-neutral-900">
        <SubScoreBar metric="structure" score={session.subScores.structure} />
        <SubScoreBar metric="fluency" score={session.subScores.fluency} />
        <SubScoreBar metric="vocabulary" score={session.subScores.vocabulary} />
        <SubScoreBar metric="pacing" score={session.subScores.pacing} />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Suggestions
        </h3>
        <ul className="space-y-2">
          {session.suggestions.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <span className="text-brand-500">•</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {session.audioRef && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Your recording</h3>
          <audio controls src={session.audioRef} className="w-full" />
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Transcript
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                session.transcriptionSource === 'live'
                  ? 'bg-good-soft text-good'
                  : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
              }`}
            >
              {session.transcriptionSource === 'live' ? 'Live transcript' : 'Simulated transcript'}
            </span>
          </h3>
          <span>
            {session.metrics.wpm} wpm · {session.metrics.fillerCount} filler words · {session.metrics.longPauseCount} long
            pauses
          </span>
        </div>
        <TranscriptView transcript={session.transcript} />

        <details className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs dark:border-neutral-800 dark:bg-neutral-950">
          <summary className="cursor-pointer font-medium text-neutral-600 dark:text-neutral-300">
            Verify transcription source
          </summary>
          <div className="mt-2 space-y-2 text-neutral-600 dark:text-neutral-400">
            {session.transcriptionSource === 'live' ? (
              <>
                <p>
                  This came from the browser's real speech recognizer, not mock data. Below is the exact raw text it
                  returned, before any cleanup:
                </p>
                <p className="rounded bg-white p-2 font-mono text-[11px] leading-relaxed dark:bg-neutral-900">
                  {session.rawLiveTranscript || '(empty — recognizer returned no text)'}
                </p>
                <p>{session.transcript.length} words tokenized from that raw text for scoring.</p>
              </>
            ) : (
              <>
                <p>
                  This session used a simulated transcript for demo purposes — the text above is mock data, not something
                  you said.
                </p>
                {session.transcriptionDebug ? (
                  <p className="rounded bg-white p-2 font-mono text-[11px] leading-relaxed dark:bg-neutral-900">
                    reason: {session.transcriptionDebug.reason}
                    {session.transcriptionDebug.lastError && <> · recognizer error: {session.transcriptionDebug.lastError}</>}
                    {session.transcriptionDebug.restartCount > 0 && <> · restarts: {session.transcriptionDebug.restartCount}</>}
                  </p>
                ) : (
                  <p>(No diagnostic info recorded — this was likely seed/demo history, not a live recording attempt.)</p>
                )}
              </>
            )}
          </div>
        </details>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 dark:border-brand-900/60 dark:bg-brand-900/20">
        <h3 className="mb-1 text-sm font-semibold text-brand-900 dark:text-brand-100">
          Tomorrow's warm-up
        </h3>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{session.nextExercise.text}</p>
      </div>
    </div>
  )
}
