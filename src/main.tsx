import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router'
import './index.css'
import App from './App.tsx'
import AuthGate from './components/auth/AuthGate'
import Onboarding from './components/onboarding/Onboarding'
import { previewAdapter } from './components/onboarding/previewAdapter'

function AppRoutes() {
  const location = useLocation()

  if (
    import.meta.env.DEV &&
    location.pathname === '/onboarding-preview'
  ) {
    return (
      <Onboarding
        adapter={previewAdapter}
        preview
        onComplete={() => {}}
      />
    )
  }

  return (
    <AuthGate>
      <App />
    </AuthGate>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
)