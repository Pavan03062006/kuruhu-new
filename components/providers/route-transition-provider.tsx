'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { RouteLoadingScreen } from '@/components/states/route-loading-screen'

type RouteTransitionContextValue = {
  startNavigation: () => void
}

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null)

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [navigationStartPath, setNavigationStartPath] = useState<string | null>(null)
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopNavigation = useCallback(() => {
    setNavigationStartPath(null)
    if (fallbackTimer.current) {
      clearTimeout(fallbackTimer.current)
      fallbackTimer.current = null
    }
  }, [])

  const startNavigation = useCallback(() => {
    setNavigationStartPath(pathname)
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current)
    // Never leave the interface covered if a navigation is cancelled.
    fallbackTimer.current = setTimeout(stopNavigation, 8_000)
  }, [pathname, stopNavigation])

  useEffect(() => {
    const handleInternalLink = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest('a')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return

      const destination = new URL(anchor.href, window.location.href)
      const current = new URL(window.location.href)
      if (
        destination.origin !== current.origin ||
        (destination.pathname === current.pathname &&
          destination.search === current.search &&
          destination.hash === current.hash)
      ) {
        return
      }

      if (destination.pathname === current.pathname && destination.search === current.search && destination.hash) {
        return
      }

      startNavigation()
    }

    document.addEventListener('click', handleInternalLink, true)
    return () => document.removeEventListener('click', handleInternalLink, true)
  }, [startNavigation])

  return (
    <RouteTransitionContext.Provider value={{ startNavigation }}>
      {children}
      {navigationStartPath === pathname && <RouteLoadingScreen overlay />}
    </RouteTransitionContext.Provider>
  )
}

export function useRouteTransition(): RouteTransitionContextValue {
  const context = useContext(RouteTransitionContext)
  if (!context) {
    throw new Error('useRouteTransition must be used inside RouteTransitionProvider')
  }
  return context
}
