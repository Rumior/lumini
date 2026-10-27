export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand">
      <span className="brand-mark"><span /></span>
      {!compact && <span className="brand-word">Lumini<small>BUSINESS MENTOR</small></span>}
    </div>
  )
}
