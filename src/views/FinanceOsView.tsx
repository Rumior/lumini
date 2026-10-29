import FinanceLedger from '@/views/FinanceLedger'

export default function FinanceOsView() {
  return (
    <section className="view finance-os-native">
      <div className="page-heading">
        <div>
          <p className="date-line">LUMINI FINANCE OS</p>
          <h1>Your financial command centre.</h1>
          <p>
            Track recorded transactions, monitor performance, and manage your
            business finances in one place.
          </p>
        </div>
      </div>

      <FinanceLedger />
    </section>
  )
}