import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const RecordPage = lazy(() => import('./pages/RecordPage').then((m) => ({ default: m.RecordPage })))
const ResultsPage = lazy(() => import('./pages/ResultsPage').then((m) => ({ default: m.ResultsPage })))
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })))
const SessionDetailPage = lazy(() =>
  import('./pages/SessionDetailPage').then((m) => ({ default: m.SessionDetailPage })),
)

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="record" element={<RecordPage />} />
          <Route path="results/:id" element={<ResultsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="history/:id" element={<SessionDetailPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
