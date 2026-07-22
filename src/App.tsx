import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { StorytellingLayout } from './components/StorytellingLayout'

const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })))
const TodayPage = lazy(() => import('./pages/storytelling/TodayPage').then((m) => ({ default: m.TodayPage })))
const RecordPage = lazy(() => import('./pages/storytelling/RecordPage').then((m) => ({ default: m.RecordPage })))
const ResultsPage = lazy(() => import('./pages/storytelling/ResultsPage').then((m) => ({ default: m.ResultsPage })))
const HistoryPage = lazy(() => import('./pages/storytelling/HistoryPage').then((m) => ({ default: m.HistoryPage })))
const SessionDetailPage = lazy(() =>
  import('./pages/storytelling/SessionDetailPage').then((m) => ({ default: m.SessionDetailPage })),
)

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="storytelling" element={<StorytellingLayout />}>
            <Route index element={<TodayPage />} />
            <Route path="record" element={<RecordPage />} />
            <Route path="results/:id" element={<ResultsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="history/:id" element={<SessionDetailPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
