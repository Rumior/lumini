import { Navigate, Route, Routes } from 'react-router'
import { Suspense, lazy } from 'react'
import { WorkspaceProvider } from '@/context/WorkspaceProvider'
import { Layout } from '@/components/app/Layout'
import AuthView from '@/views/AuthView'
import { routePaths } from '@/config/navigation'
import { useAuth } from '@/context/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import './App.css'

const HomeView = lazy(() => import('@/views/HomeView'))
const MentorView = lazy(() => import('@/views/MentorView'))
const BusinessView = lazy(() => import('@/views/BusinessView'))
const FinanceOsView = lazy(() => import('@/views/FinanceOsView'))
const PlansView = lazy(() => import('@/views/PlansView'))
const InsightsView = lazy(() => import('@/views/InsightsView'))
const SettingsView = lazy(() => import('@/views/SettingsView'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }
  return <>{children}</>
}

function LoadingFallback() {
  return <div className="p-8 text-center">Loading...</div>
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth()
  
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/auth" element={isLoading ? null : isAuthenticated ? <Navigate to={routePaths.home} replace /> : <AuthView />} />
        <Route element={
          <ProtectedRoute>
            <WorkspaceProvider>
              <Layout />
            </WorkspaceProvider>
          </ProtectedRoute>
        }>
          <Route index element={<Suspense fallback={<LoadingFallback />}><HomeView /></Suspense>} />
          <Route path={routePaths.mentor} element={<Suspense fallback={<LoadingFallback />}><MentorView /></Suspense>} />
          <Route path={routePaths.business} element={<Suspense fallback={<LoadingFallback />}><BusinessView /></Suspense>} />
          <Route path={routePaths['finance-os']} element={<Suspense fallback={<LoadingFallback />}><FinanceOsView /></Suspense>} />
          <Route path={routePaths.plans} element={<Suspense fallback={<LoadingFallback />}><PlansView /></Suspense>} />
          <Route path={routePaths.insights} element={<Suspense fallback={<LoadingFallback />}><InsightsView /></Suspense>} />
          <Route path={routePaths.settings} element={<Suspense fallback={<LoadingFallback />}><SettingsView /></Suspense>} />
        </Route>
        <Route path="*" element={<Navigate to={routePaths.home} replace />} />
      </Routes>
    </ErrorBoundary>
  )
}