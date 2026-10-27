import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { OrganizationProvider } from './context/OrganizationContext.tsx'
import { AuditProvider } from './context/AuditContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <OrganizationProvider>
          <AuditProvider>
            <App />
          </AuditProvider>
        </OrganizationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
