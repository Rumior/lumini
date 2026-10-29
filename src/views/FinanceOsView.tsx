export default function FinanceOsView() {
  return (
    <section className="view finance-os-native">
      <iframe
        src="/finance-os/dashboard.html"
        title="Lumini Finance OS"
        style={{
          display: 'block',
          width: '100%',
          height: 'calc(100vh - 100px)',
          minHeight: '700px',
          border: 'none',
          borderRadius: '12px',
          background: '#faf6ee',
        }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
      />
    </section>
  )
}