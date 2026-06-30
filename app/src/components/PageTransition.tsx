import { useEffect, ReactNode } from 'react'
import { useLocation } from 'react-router'

interface PageTransitionProps {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const { pathname } = useLocation()

  useEffect(() => {
    // Reset scroll position to top instantly on page navigation
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div key={pathname} className="animate-page-transition">
      {children}
    </div>
  )
}
