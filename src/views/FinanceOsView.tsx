import { useEffect } from 'react'

export default function FinanceOsView() {
  useEffect(() => {
    // Ensure styles/scripts don't conflict with app theme
  }, [])

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 140px)', minHeight: '600px' }}>
      <iframe
        src="/finance-os/dashboard.html"
        title="Finance OS"
        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px', background: '#faf6ee' }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  )
}
