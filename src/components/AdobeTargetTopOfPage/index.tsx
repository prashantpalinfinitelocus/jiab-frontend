'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import useAppSelector from '@/hooks/useSelector'
import { LOCAL_STORAGE_KEYS } from '@/api'

// Global flag to prevent multiple fires across component remounts
const TARGET_TOP_PAGE_FIRED_KEY = '__adobe_target_top_page_fired__'

/**
 * Top of the Page Event (Adobe Target Call)
 * Should be fired on top of the page
 * This event fetches personalization decisions asynchronously
 */
const AdobeTargetTopOfPage = () => {
  const checkAlloyRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()
  const { isAuthenticated } = useAppSelector(state => state.auth)
  const isAuthenticatedRef = useRef(isAuthenticated)

  // Keep ref updated with latest authentication state
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated
  }, [isAuthenticated])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Reset the flag when pathname changes to allow firing on new route
    delete (window as any)[TARGET_TOP_PAGE_FIRED_KEY]

    const fireTopOfPageEvent = () => {
      // Double check global flag
      if ((window as any)[TARGET_TOP_PAGE_FIRED_KEY]) {
        return false
      }

      try {
        // Use ref to get the latest authentication state (always up-to-date)
        const currentAuthState = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN)

        // Build data object with login status and other parameters
        const dataObject: any = {
          _adobe: {
            target: {
              isLoggedin: currentAuthState ? 'true' : 'false'
            }
          }
        }

        // Fire the top of page event for Adobe Target
        window.alloy('sendEvent', {
          type: 'decisioning.propositionFetch',
          // decisionScopes: ['_view_'],
          renderDecisions: true,
          personalization: {
            defaultPersonalizationEnabled: true,
            sendDisplayEvent: false // Enable automatic display/interact events
          },
          data: dataObject
        })
        // Mark as fired globally
        ;(window as any)[TARGET_TOP_PAGE_FIRED_KEY] = true
        return true
      } catch {
        // Alloy not ready yet
        return false
      }
    }

    // Try to fire immediately
    const fired = fireTopOfPageEvent()

    if (!fired) {
      // If it fails, wait for alloy to be available
      timeoutRef.current = setTimeout(() => {
        if (checkAlloyRef.current) {
          clearInterval(checkAlloyRef.current)
          checkAlloyRef.current = null
        }
      }, 10000)

      checkAlloyRef.current = setInterval(() => {
        // Check global flag before attempting
        if ((window as any)[TARGET_TOP_PAGE_FIRED_KEY]) {
          // Already fired, cleanup
          if (checkAlloyRef.current) {
            clearInterval(checkAlloyRef.current)
            checkAlloyRef.current = null
          }
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
          return
        }

        const success = fireTopOfPageEvent()
        if (success) {
          // Successfully fired, cleanup
          if (checkAlloyRef.current) {
            clearInterval(checkAlloyRef.current)
            checkAlloyRef.current = null
          }
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
        }
      }, 100)
    }

    return () => {
      if (checkAlloyRef.current) {
        clearInterval(checkAlloyRef.current)
        checkAlloyRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [pathname])

  return null
}

export default AdobeTargetTopOfPage
