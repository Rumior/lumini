import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { routePaths } from '@/config/navigation'
import type { View } from '@/types'

/** Navigate to a view by id and scroll to top. */
export function useGo() {
  const navigate = useNavigate()
  return useCallback((view: View) => {
    navigate(routePaths[view])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate])
}
