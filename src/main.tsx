import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AppStoreProvider } from './store/AppStore'
import { AuthStoreProvider } from './store/AuthStore'
import { ToastProvider } from './store/ToastStore'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthStoreProvider>
          <AppStoreProvider>
            <App />
          </AppStoreProvider>
        </AuthStoreProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
