import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api } from '@/lib/api/client'
import { useOrganization } from '@/context/OrganizationContext'

type Account = {
  id: string
  name: string
  account_type: 'cash' | 'bank' | 'mobile_money' | 'other'
  currency: string
  opening_balance: string | number
  opening_balance_date: string
  current_balance: string | number
  notes?: string | null
}

type Transaction = {
  id: string
  account_id: string
  transfer_to_account_id?: string | null
  account_name: string
  transfer_to_account_name?: string | null
  transaction_type: 'income' | 'expense' | 'transfer' | 'capital' | 'withdrawal'
  amount: string | number
  transaction_date: string
  category: string
  description: string
  reference?: string | null
  currency: string
}

type Summary = {
  currency: string
  income: string | number
  expenses: string | number
  capital_introduced: string | number
  owner_withdrawals: string | number
  transaction_count: number
  operating_result: number
}

type LedgerData = {
  accounts: Account[]
  transactions: Transaction[]
  summary: Summary[]
  period: { type: string; date: string; start: string; end: string }
}

function localDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function amount(value: string | number, currency: string) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value))
}

const initialAccount = {
  name: '',
  accountType: 'cash' as Account['account_type'],
  currency: 'KES',
  openingBalance: '0',
  openingBalanceDate: localDate(),
  notes: '',
}

const initialTransaction = {
  accountId: '',
  transferToAccountId: '',
  transactionType: 'income' as Transaction['transaction_type'],
  amount: '',
  transactionDate: localDate(),
  category: 'Sales',
  description: '',
  reference: '',
}

export default function FinanceLedger() {
  const { organization } = useOrganization()
  const [data, setData] = useState<LedgerData | null>(null)
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('month')
  const [date, setDate] = useState(localDate())
  const [accountForm, setAccountForm] = useState(initialAccount)
  const [transactionForm, setTransactionForm] = useState(initialTransaction)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    if (!organization?.id) {
      setData(null)
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await api.get<LedgerData>(
        `/organizations/${organization.id}/finances?period=${period}&date=${date}`,
      )
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load financial records.')
    } finally {
      setLoading(false)
    }
  }, [organization?.id, period, date])

  useEffect(() => {
    void load()
  }, [load])

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!organization?.id) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      await api.post(`/organizations/${organization.id}/finances/accounts`, {
        ...accountForm,
        openingBalance: Number(accountForm.openingBalance),
      })
      setAccountForm({ ...initialAccount, openingBalanceDate: localDate() })
      setShowAccountForm(false)
      setNotice('Account created.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account.')
    } finally {
      setSaving(false)
    }
  }

  async function createTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!organization?.id) return

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const payload = {
        accountId: transactionForm.accountId,
        ...(transactionForm.transactionType === 'transfer'
          ? { transferToAccountId: transactionForm.transferToAccountId }
          : {}),
        transactionType: transactionForm.transactionType,
        amount: Number(transactionForm.amount),
        transactionDate: transactionForm.transactionDate,
        category: transactionForm.category,
        description: transactionForm.description,
        reference: transactionForm.reference || undefined,
      }

      await api.post(`/organizations/${organization.id}/finances/transactions`, payload)
      setTransactionForm({ ...initialTransaction, transactionDate: localDate() })
      setShowTransactionForm(false)
      setNotice('Transaction saved.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save transaction.')
    } finally {
      setSaving(false)
    }
  }

  const accounts = data?.accounts ?? []
  const transactions = data?.transactions ?? []
  const summaries = data?.summary ?? []
  const needsTransferDestination = transactionForm.transactionType === 'transfer'

  return (
    <section className="ledger-panel">
      <div className="section-head ledger-heading">
        <div>
          <p className="eyebrow">POSTED RECORDS · DATABASE-BACKED</p>
          <h3>Live financial ledger</h3>
          <p className="ledger-subtitle">
            Record real transactions and track account balances separately from profit.
          </p>
        </div>
        <div className="ledger-actions">
          <button type="button" className="secondary-btn" onClick={() => setShowAccountForm(v => !v)}>
            {showAccountForm ? 'Cancel account' : '+ Account'}
          </button>
          <button
            type="button"
            className="primary-btn"
            disabled={accounts.length === 0}
            onClick={() => setShowTransactionForm(v => !v)}
          >
            {showTransactionForm ? 'Cancel entry' : '+ Transaction'}
          </button>
        </div>
      </div>

      {!organization && <p className="ledger-message">Select or create an organisation to manage its financial records.</p>}
      {loading && <p className="ledger-message">Loading saved financial records…</p>}
      {error && <p className="ledger-error" role="alert">{error}</p>}
      {notice && <p className="ledger-success" role="status">{notice}</p>}

      {showAccountForm && (
        <form className="ledger-form" onSubmit={createAccount}>
          <h4>Create an account</h4>
          <div className="ledger-form-grid">
            <label>Account name
              <input required maxLength={120} value={accountForm.name} onChange={e => setAccountForm(s => ({ ...s, name: e.target.value }))} placeholder="e.g. Main cash box" />
            </label>
            <label>Account type
              <select value={accountForm.accountType} onChange={e => setAccountForm(s => ({ ...s, accountType: e.target.value as Account['account_type'] }))}>
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="mobile_money">Mobile money</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>Currency (ISO code)
              <input required minLength={3} maxLength={3} pattern="[A-Za-z]{3}" value={accountForm.currency} onChange={e => setAccountForm(s => ({ ...s, currency: e.target.value.toUpperCase() }))} />
            </label>
            <label>Opening balance
              <input required type="number" min="0" step="0.01" value={accountForm.openingBalance} onChange={e => setAccountForm(s => ({ ...s, openingBalance: e.target.value }))} />
            </label>
            <label>Opening balance date
              <input required type="date" value={accountForm.openingBalanceDate} onChange={e => setAccountForm(s => ({ ...s, openingBalanceDate: e.target.value }))} />
            </label>
            <label>Notes (optional)
              <input maxLength={500} value={accountForm.notes} onChange={e => setAccountForm(s => ({ ...s, notes: e.target.value }))} />
            </label>
          </div>
          <button className="primary-btn" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save account'}</button>
        </form>
      )}

      {showTransactionForm && (
        <form className="ledger-form" onSubmit={createTransaction}>
          <h4>Record a transaction</h4>
          <div className="ledger-form-grid">
            <label>Transaction type
              <select value={transactionForm.transactionType} onChange={e => {
                const transactionType = e.target.value as Transaction['transaction_type']
                const category = transactionType === 'income' ? 'Sales'
                  : transactionType === 'expense' ? 'Operating expense'
                  : transactionType === 'transfer' ? 'Account transfer'
                  : transactionType === 'capital' ? 'Owner capital'
                  : 'Owner withdrawal'
                setTransactionForm(s => ({ ...s, transactionType, category, transferToAccountId: '' }))
              }}>
                <option value="income">Income / sales</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer between accounts</option>
                <option value="capital">Capital introduced</option>
                <option value="withdrawal">Owner withdrawal</option>
              </select>
            </label>
            <label>Account
              <select required value={transactionForm.accountId} onChange={e => setTransactionForm(s => ({ ...s, accountId: e.target.value }))}>
                <option value="">Select account</option>
                {accounts.map(account => <option key={account.id} value={account.id}>{account.name} · {account.currency}</option>)}
              </select>
            </label>
            {needsTransferDestination && (
              <label>Transfer to
                <select required value={transactionForm.transferToAccountId} onChange={e => setTransactionForm(s => ({ ...s, transferToAccountId: e.target.value }))}>
                  <option value="">Select destination</option>
                  {accounts.filter(account => account.id !== transactionForm.accountId).map(account => (
                    <option key={account.id} value={account.id}>{account.name} · {account.currency}</option>
                  ))}
                </select>
              </label>
            )}
            <label>Amount
              <input required type="number" min="0.01" step="0.01" value={transactionForm.amount} onChange={e => setTransactionForm(s => ({ ...s, amount: e.target.value }))} />
            </label>
            <label>Date
              <input required type="date" value={transactionForm.transactionDate} onChange={e => setTransactionForm(s => ({ ...s, transactionDate: e.target.value }))} />
            </label>
            <label>Category
              <input required maxLength={100} value={transactionForm.category} onChange={e => setTransactionForm(s => ({ ...s, category: e.target.value }))} />
            </label>
            <label>Description
              <input required maxLength={500} value={transactionForm.description} onChange={e => setTransactionForm(s => ({ ...s, description: e.target.value }))} placeholder="What was this transaction for?" />
            </label>
            <label>Reference (optional)
              <input maxLength={120} value={transactionForm.reference} onChange={e => setTransactionForm(s => ({ ...s, reference: e.target.value }))} />
            </label>
          </div>
          <p className="ledger-hint">
            Transfers do not count as income or expenses. Capital introduced and owner withdrawals are shown separately from operating results.
          </p>
          <button className="primary-btn" type="submit" disabled={saving || !accounts.length}>{saving ? 'Saving…' : 'Save transaction'}</button>
        </form>
      )}

      <div className="ledger-period">
        <label>Summary period
          <select value={period} onChange={e => setPeriod(e.target.value as 'day' | 'month' | 'year')}>
            <option value="day">Daily</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </label>
        <label>Reference date
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </label>
      </div>

      <div className="ledger-account-grid">
        {accounts.map(account => (
          <article className="ledger-account" key={account.id}>
            <span>{account.name}</span>
            <strong>{amount(account.current_balance, account.currency)}</strong>
            <small>{account.account_type.replace('_', ' ')} · Opening {amount(account.opening_balance, account.currency)}</small>
            <small>Opening date: {String(account.opening_balance_date).slice(0, 10)}</small>
          </article>
        ))}
        {!loading && accounts.length === 0 && (
          <p className="ledger-message">No accounts yet. Create a cash, bank or mobile-money account to begin recording your opening position.</p>
        )}
      </div>

      <div className="ledger-summary-grid">
        {summaries.map(summary => (
          <article className="ledger-summary" key={summary.currency}>
            <p className="eyebrow">{summary.currency} · SELECTED PERIOD</p>
            <div><span>Income</span><strong>{amount(summary.income, summary.currency)}</strong></div>
            <div><span>Expenses</span><strong>{amount(summary.expenses, summary.currency)}</strong></div>
            <div><span>Operating result</span><strong className={summary.operating_result >= 0 ? 'positive' : 'negative'}>{amount(summary.operating_result, summary.currency)}</strong></div>
            <div><span>Capital introduced</span><strong>{amount(summary.capital_introduced, summary.currency)}</strong></div>
            <div><span>Owner withdrawals</span><strong>{amount(summary.owner_withdrawals, summary.currency)}</strong></div>
            <small>{summary.transaction_count} transactions in this period</small>
          </article>
        ))}
      </div>

      <div className="ledger-history">
        <div className="section-head">
          <div><p className="eyebrow">LATEST SAVED ENTRIES</p><h4>Transaction history</h4></div>
          <button type="button" className="secondary-btn" onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
        </div>
        {transactions.length === 0 ? (
          <p className="ledger-message">No transactions recorded yet.</p>
        ) : (
          <div className="ledger-table-wrap">
            <table className="ledger-table">
              <thead><tr><th>Date</th><th>Transaction</th><th>Account</th><th>Description</th><th>Amount</th></tr></thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{String(transaction.transaction_date).slice(0, 10)}</td>
                    <td>{transaction.transaction_type === 'income' ? 'Income'
                      : transaction.transaction_type === 'expense' ? 'Expense'
                      : transaction.transaction_type === 'transfer' ? 'Transfer'
                      : transaction.transaction_type === 'capital' ? 'Capital'
                      : 'Withdrawal'}</td>
                    <td>{transaction.account_name}{transaction.transaction_type === 'transfer' && transaction.transfer_to_account_name ? ` → ${transaction.transfer_to_account_name}` : ''}</td>
                    <td><strong>{transaction.description}</strong><small>{transaction.category}{transaction.reference ? ` · ${transaction.reference}` : ''}</small></td>
                    <td className={transaction.transaction_type === 'income' || transaction.transaction_type === 'capital' ? 'positive' : transaction.transaction_type === 'expense' || transaction.transaction_type === 'withdrawal' ? 'negative' : ''}>
                      {amount(transaction.amount, transaction.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="ledger-hint">Showing the latest 100 saved entries. Balances are calculated from each account’s opening date and recorded transactions.</p>
      </div>
    </section>
  )
}
