import type { TranscriptToken } from '../types'

const LONG_PAUSE_THRESHOLD = 1.5

export function TranscriptView({ transcript }: { transcript: TranscriptToken[] }) {
  return (
    <p className="text-[15px] leading-8">
      {transcript.map((token, i) => (
        <span key={i}>
          {token.pauseBefore > LONG_PAUSE_THRESHOLD && (
            <span
              className="mx-1 inline-flex items-center gap-1 rounded-full bg-[#fab21926] px-1.5 py-0.5 align-middle text-[11px] font-medium text-[#a06a00] dark:text-[#fab219]"
              title={`${token.pauseBefore.toFixed(1)}s pause`}
            >
              ⏸ {token.pauseBefore.toFixed(1)}s
            </span>
          )}
          <span
            className={
              token.isFiller
                ? 'rounded bg-[#d03b3b1f] px-0.5 text-[#a82f2f] underline decoration-dotted decoration-[#a82f2f]/60 dark:text-[#e66767]'
                : undefined
            }
            title={token.isFiller ? 'Filler word' : undefined}
          >
            {token.word}
          </span>{' '}
        </span>
      ))}
    </p>
  )
}
