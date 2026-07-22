import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

interface ToastContextValue {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const hideTimerRef = useRef<number | null>(null)
  const clearTimerRef = useRef<number | null>(null)

  const showToast = useCallback((msg: string) => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
    if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current)
    setMessage(msg)
    requestAnimationFrame(() => setVisible(true))
    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false)
      clearTimerRef.current = window.setTimeout(() => setMessage(null), 300)
    }, 2800)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div
            className={`pointer-events-auto rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300 dark:bg-white dark:text-neutral-900 ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            }`}
          >
            {message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
