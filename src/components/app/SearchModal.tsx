import { useState } from 'react'
import { ArrowRight, Search, X } from 'lucide-react'
import { nav } from '@/config/navigation'
import type { View } from '@/types'

const searchItems: { title: string; sub: string; view: View }[] = [
  ...nav.map(n => ({ title: n.label, sub: 'Navigate', view: n.id })),
  { title: 'Pricing & break-even', sub: 'Financial tool', view: 'finance-os' },
  { title: 'Cash collection forecast', sub: 'Current action', view: 'plans' },
  { title: 'September financial health', sub: 'Report', view: 'insights' },
]

type Props = { onClose: () => void; onGo: (v: View) => void }

export function SearchModal({ onClose, onGo }: Props) {
  const [search, setSearch] = useState('')
  const results = searchItems.filter(x => `${x.title} ${x.sub}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="search-modal" role="dialog" aria-modal="true" aria-label="Search workspace">
        <div className="search-input">
          <Search size={20} />
          <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools, reports and actions…" />
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="search-results">
          <p>{search ? `${results.length} RESULTS` : 'QUICK LINKS'}</p>
          {results.map(x => (
            <button key={x.title} onClick={() => onGo(x.view)}>
              <span><strong>{x.title}</strong><small>{x.sub}</small></span><ArrowRight size={16} />
            </button>
          ))}
          {!results.length && <div className="no-results">No matching items. Try “finance” or “cash”.</div>}
        </div>
        <footer><span><kbd>↵</kbd> to open</span><span><kbd>esc</kbd> to close</span></footer>
      </div>
    </div>
  )
}
