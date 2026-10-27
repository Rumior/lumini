import type { ReactNode } from 'react'

export function EvidenceTag({ children, tone = '' }: { children: ReactNode; tone?: string }) {
  return <span className={`evidence-tag ${tone}`}><span />{children}</span>
}
