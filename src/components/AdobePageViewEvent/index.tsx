
import useAppSelector from '@/hooks/useSelector'
import { routesToName } from '@/utils/alloyEvents'
import { pushPageViewToDataLayer } from '@/utils/gtmDataLayer'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useGetKOCID } from '@/api/hooks/ProfileHooks'

// Key for storing previous path in sessionStorage
const PREVIOUS_PATH_KEY = '__adobe_previous_path__'

const AdobePageViewEvent = () => {
  const { selectedLanguage } = useAppSelector(state => state.language)
  const { isAuthenticated } = useAppSelector(state => state.auth)
  const pathname = usePathname()
  const { data: kocidData } = useGetKOCID();
  const [hasTracked, setHasTracked] = useState(false);

  useEffect(() => {
    // Reset tracking state when pathname changes
    setHasTracked(false);
  }, [pathname]);

  useEffect(() => {
    // For non-authenticated users, fire immediately without waiting for kocidData
    // For authenticated users, wait for kocidData to be available
    const shouldWaitForKocid = isAuthenticated;
    const canFire = !shouldWaitForKocid || (shouldWaitForKocid && kocidData !== undefined);

    if (window !== undefined && pathname && canFire && !hasTracked) {
      // Get previous path from sessionStorage
      const previousPath = sessionStorage.getItem(PREVIOUS_PATH_KEY) || '';
      
      // Extract kocid only if user is authenticated and data is available
      const effectiveKocid = kocidData?.ok ? kocidData?.data?.kocid ?? '' : '';
      
      // Push to GTM dataLayer (flat structure per GTM guide)
      pushPageViewToDataLayer({
        hashedKocid: effectiveKocid,
        brand: 'Sprite',
        country: 'IN',
        language: selectedLanguage ?? 'en',
        campaignName: '', // Can be extracted from URL params if needed
        pageName: routesToName[pathname as keyof typeof routesToName],
        server: window.location.hostname,
        pageURL: window.location.href,
        domain: window.location.hostname,
      });
      
      setHasTracked(true);
      
      // Store current pathname as previous for next navigation
      sessionStorage.setItem(PREVIOUS_PATH_KEY, pathname);
    }
  }, [pathname, selectedLanguage, kocidData, hasTracked, isAuthenticated])

  return null
}

export default AdobePageViewEvent
