import { useLocation } from 'react-router'
import App from './App.tsx'
import AuthGate from './components/auth/AuthGate'
import Onboarding from './components/onboarding/Onboarding'
import { previewAdapter } from './components/onboarding/previewAdapter'

export default function AppRoutes() {
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