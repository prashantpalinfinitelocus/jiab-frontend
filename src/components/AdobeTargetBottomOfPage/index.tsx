'use client'

/**
 * Bottom of the Page Event (Adobe Page View call)
 * 
 * DISABLED: This component has been disabled to prevent duplicate calls with no event name.
 * 
 * Previously, this component was sending:
 * window.alloy('sendEvent', {
 *   personalization: { includeRenderedPropositions: true },
 *   xdm: {}
 * })
 * 
 * The empty xdm: {} was causing Adobe Edge to receive calls with no eventType,
 * resulting in "no event name" interactions.
 * 
 * Since we use renderDecisions: true in AdobeTargetTopOfPage, Alloy automatically
 * sends display notifications for rendered propositions. This bottom of page event
 * is redundant and has been disabled to prevent duplicate calls.
 * 
 * If you need to re-enable this in the future, ensure you provide a proper
 * eventType in the xdm payload, such as:
 * xdm: {
 *   eventType: 'web.webpagedetails.pageViews',
 *   ...other required fields
 * }
 */
const AdobeTargetBottomOfPage = () => {
  // const checkAlloyRef = useRef<NodeJS.Timeout | null>(null)
  // const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  // const loadHandlerRef = useRef<(() => void) | null>(null)

  // useEffect(() => {
  //   if (typeof window === 'undefined') return

  //   // Check global flag - if already fired, don't fire again
  //   if ((window as any)[TARGET_BOTTOM_PAGE_FIRED_KEY]) {
  //     return
  //   }

  //   const fireBottomOfPageEvent = () => {
  //     // Double check global flag
  //     if ((window as any)[TARGET_BOTTOM_PAGE_FIRED_KEY]) {
  //       return false
  //     }
      
  //     try {
  //       // Fire the bottom of page event after target call
  //       window.alloy('sendEvent', {
  //         personalization: {
  //           includeRenderedPropositions: true
  //         },
  //         xdm: {}
  //       })
  //       // Mark as fired globally
  //       ;(window as any)[TARGET_BOTTOM_PAGE_FIRED_KEY] = true
  //       return true
  //     } catch {
  //       // Alloy not ready yet
  //       return false
  //     }
  //   }

  //   const attemptFire = () => {
  //     const success = fireBottomOfPageEvent()
  //     if (success) {
  //       // Successfully fired, cleanup
  //       if (checkAlloyRef.current) {
  //         clearInterval(checkAlloyRef.current)
  //         checkAlloyRef.current = null
  //       }
  //       if (timeoutRef.current) {
  //         clearTimeout(timeoutRef.current)
  //         timeoutRef.current = null
  //       }
  //     }
  //     return success
  //   }

  //   // Wait for alloy to be available
  //   const waitForAlloy = () => {
  //     // Check global flag before setting up interval
  //     if (checkAlloyRef.current || (window as any)[TARGET_BOTTOM_PAGE_FIRED_KEY]) {
  //       return // Already waiting or fired
  //     }

  //     checkAlloyRef.current = setInterval(() => {
  //       // Check global flag
  //       if ((window as any)[TARGET_BOTTOM_PAGE_FIRED_KEY]) {
  //         // Already fired, cleanup
  //         if (checkAlloyRef.current) {
  //           clearInterval(checkAlloyRef.current)
  //           checkAlloyRef.current = null
  //         }
  //         if (timeoutRef.current) {
  //           clearTimeout(timeoutRef.current)
  //           timeoutRef.current = null
  //         }
  //         return
  //       }

  //       if (attemptFire()) {
  //         // Successfully fired
  //       }
  //     }, 100)

  //     timeoutRef.current = setTimeout(() => {
  //       if (checkAlloyRef.current) {
  //         clearInterval(checkAlloyRef.current)
  //         checkAlloyRef.current = null
  //       }
  //     }, 10000)
  //   }

  //   // Check if page is already loaded
  //   if (document.readyState === 'complete') {
  //     if (!attemptFire()) {
  //       waitForAlloy()
  //     }
  //   } else {
  //     loadHandlerRef.current = () => {
  //       if (!attemptFire()) {
  //         waitForAlloy()
  //       }
  //     }
  //     window.addEventListener('load', loadHandlerRef.current)
  //   }

  //   return () => {
  //     if (checkAlloyRef.current) {
  //       clearInterval(checkAlloyRef.current)
  //       checkAlloyRef.current = null
  //     }
  //     if (timeoutRef.current) {
  //       clearTimeout(timeoutRef.current)
  //       timeoutRef.current = null
  //     }
  //     if (loadHandlerRef.current) {
  //       window.removeEventListener('load', loadHandlerRef.current)
  //       loadHandlerRef.current = null
  //     }
  //   }
  // }, [])

  return null
}

export default AdobeTargetBottomOfPage

