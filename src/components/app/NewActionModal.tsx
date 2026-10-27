import { ArrowRight, X } from 'lucide-react'
import { mockDates, mockUser } from '@/data/mock-data'
import { useWorkspace } from '@/context/workspace-context'

export function NewActionModal() {
  const { newActionOpen, newActionTitle, setNewActionTitle, closeNewAction, submitNewAction } = useWorkspace()
  if (!newActionOpen) return null

  return (
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) closeNewAction() }}>
      <div className="action-modal" role="dialog" aria-modal="true" aria-labelledby="new-action-title">
        <button className="modal-close icon-btn" onClick={closeNewAction} aria-label="Close"><X size={19} /></button>
        <p className="eyebrow">ADD TO YOUR PLAN</p>
        <h2 id="new-action-title">Make the next step concrete.</h2>
        <p>Recommendations only become actions with your approval.</p>
        <form onSubmit={e => { e.preventDefault(); submitNewAction() }}>
          <label><span>Action title</span><textarea autoFocus rows={3} value={newActionTitle} onChange={e => setNewActionTitle(e.target.value)} placeholder="What will you do?" required /></label>
          <div className="modal-fields">
            <label><span>Owner</span><input value={mockUser.fullName} readOnly /></label>
            <label><span>Review date</span><input value={mockDates.newActionReviewDate} readOnly /></label>
          </div>
          <button className="primary-btn" type="submit" disabled={!newActionTitle.trim()}>Add action <ArrowRight size={16} /></button>
        </form>
      </div>
    </div>
  )
}
